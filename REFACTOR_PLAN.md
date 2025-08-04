# Complete Event Sourcing Implementation Guide for Claude Code

## Executive Summary

You are implementing event sourcing for Poker Connect Hub to solve critical state management bugs. The main issue is that the UI sometimes shows invalid poker actions (like "check" when facing a bet) because state can become inconsistent. Event sourcing solves this by making the event stream the single source of truth.

**Project Context:**
- **Stack:** Next.js 14 (App Router), TypeScript, MongoDB with Mongoose, Zustand, TailwindCSS
- **Current Architecture:** Poker engine with state machine, Zustand store for UI state, MongoDB for persistence
- **Problem:** State inconsistencies between UI and engine causing invalid actions to appear
- **Solution:** Event sourcing - every action becomes an event, state is always rebuilt from events

## Architecture Overview

### Current Flow (Buggy):
```
User Action → UI State → Engine Validation → Update State
                ↑                               ↓
                └────── Can get out of sync ────┘
```

### New Event-Sourced Flow (Bug-Free):
```
User Action → Command → Validate Against Event-Built State → Create Event → Store Event
                ↑                                                              ↓
                └──────────── Single Source of Truth (Events) ←───────────────┘
```

## File Structure Optimization

Before starting implementation, optimize the project structure:

### 1. Create New Directories:
```
src/
├── poker-engine/
│   ├── adapters/           # NEW - Event sourcing adapters
│   │   └── EventSourcingAdapter.ts
│   ├── commands/           # NEW - Command pattern implementation
│   │   ├── types.ts
│   │   └── validator.ts
│   └── repositories/       # NEW - Data access layer
│       └── HandEventRepository.ts
```

### 2. Reorganize Existing Files:
- Move all poker validation logic from various places into `src/poker-engine/core/rules.ts`
- Consolidate action types in `src/poker-engine/core/actions.ts`
- Ensure all event types are in `src/poker-engine/core/events.ts`

---

## PHASE 1: Database Layer - Event Storage

### Context
We need to store every single poker action as an event. These events will be the source of truth for game state.

### Implementation Task

**Create `src/models/HandEvent.ts`:**

```typescript
import { Schema, model, models, Document, Types } from 'mongoose';

// Define the interface for type safety
export interface IHandEvent extends Document {
  handId: Types.ObjectId;          // Reference to SharedHand
  eventType: string;                // HAND_INITIALIZED, BLINDS_POSTED, ACTION_TAKEN, etc.
  eventData: Record<string, any>;   // The actual event payload
  eventVersion: number;             // For future event schema changes
  sequenceNumber: number;           // Order of events (0, 1, 2, ...)
  timestamp: Date;                  // When the event occurred
  playerId?: string;                // Who triggered this event (optional)
  
  // Metadata for debugging
  metadata?: {
    engineStateBefore?: any;        // State before this event
    engineStateAfter?: any;         // State after this event
    validActions?: string[];        // What actions were valid at this point
  };
}

const HandEventSchema = new Schema<IHandEvent>({
  handId: { 
    type: Schema.Types.ObjectId, 
    ref: 'SharedHand',
    required: true,
    index: true 
  },
  eventType: { 
    type: String, 
    required: true,
    enum: [
      // These should match your existing EventType enum in poker-engine/core/events.ts
      'HAND_INITIALIZED',
      'BLINDS_POSTED',
      'ACTION_TAKEN',
      'STREET_COMPLETED', 
      'HAND_COMPLETED'
    ]
  },
  eventData: {
    type: Schema.Types.Mixed,
    required: true
  },
  eventVersion: {
    type: Number,
    default: 1
  },
  sequenceNumber: { 
    type: Number, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  playerId: {
    type: String,
    sparse: true  // Allow null but index non-null values
  },
  metadata: {
    type: Schema.Types.Mixed,
    required: false
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

// Compound index for efficient queries and uniqueness
HandEventSchema.index({ handId: 1, sequenceNumber: 1 }, { unique: true });

// Index for querying events by type
HandEventSchema.index({ eventType: 1, timestamp: -1 });

// Index for player history
HandEventSchema.index({ playerId: 1, timestamp: -1 }, { sparse: true });

export const HandEvent = models.HandEvent || model<IHandEvent>('HandEvent', HandEventSchema);
```

**Update `src/models/SharedHand.ts`:**

Add these fields to the existing schema:

```typescript
// In your existing SharedHandSchema, add:
events: [{
  type: Schema.Types.ObjectId,
  ref: 'HandEvent'
}],

// Track the last event sequence for optimistic concurrency control
lastEventSequence: { 
  type: Number, 
  default: -1 
},

// All new hands use event sourcing
isEventSourced: { 
  type: Boolean, 
  default: true 
},

// Cache the current state for performance (optional)
currentStateCache: {
  type: Schema.Types.Mixed,
  required: false
},

// When was the cache last updated
cacheUpdatedAt: {
  type: Date,
  required: false
}
```

---

## PHASE 2: Event Sourcing Infrastructure

### Context
The EventSourcingAdapter is the core of our solution. It ensures that state is ALWAYS derived from events, making bugs impossible.

### Implementation Task

**Create `src/poker-engine/adapters/EventSourcingAdapter.ts`:**

```typescript
import { EngineEvent, EventType } from '../core/events';
import { EngineState } from '../core/state';
import { PokerStateMachine } from '../core/engine';
import { HandEvent, IHandEvent } from '@/models/HandEvent';
import { SharedHand } from '@/models/SharedHand';
import { connectDB } from '@/lib/db';
import { ActionType } from '../core/actions';

export class EventSourcingAdapter {
  private engine: PokerStateMachine;
  private handId: string;
  private cachedState: EngineState | null = null;
  private lastSequenceNumber: number = -1;

  constructor(handId: string) {
    this.handId = handId;
    this.engine = new PokerStateMachine();
  }

  /**
   * Persist an engine event to the database
   * This is called after the engine processes an action
   */
  async persistEvent(event: EngineEvent): Promise<IHandEvent> {
    await connectDB();
    
    // Get the next sequence number
    const hand = await SharedHand.findById(this.handId);
    if (!hand) {
      throw new Error(`Hand ${this.handId} not found`);
    }
    
    const sequenceNumber = hand.lastEventSequence + 1;
    
    // Create the event document
    const handEvent = new HandEvent({
      handId: this.handId,
      eventType: event.type,
      eventData: event.data,
      eventVersion: 1,
      sequenceNumber,
      timestamp: event.timestamp || new Date(),
      playerId: event.data?.playerId,
      metadata: {
        // Store state for debugging
        engineStateBefore: this.cachedState,
        validActions: this.getValidActionsForState(this.cachedState || this.engine.getInitialState())
      }
    });

    // Save event and update hand in a transaction
    const session = await HandEvent.startSession();
    try {
      await session.withTransaction(async () => {
        await handEvent.save({ session });
        
        // Update hand with new sequence number
        hand.lastEventSequence = sequenceNumber;
        hand.events.push(handEvent._id);
        await hand.save({ session });
      });
    } finally {
      await session.endSession();
    }

    // Clear cached state
    this.cachedState = null;
    
    return handEvent;
  }

  /**
   * Rebuild the current game state from all events
   * This is the SINGLE SOURCE OF TRUTH
   */
  async rebuildState(): Promise<EngineState> {
    // Check cache first
    if (this.cachedState && this.lastSequenceNumber >= 0) {
      const latestEvent = await HandEvent
        .findOne({ handId: this.handId })
        .sort({ sequenceNumber: -1 })
        .select('sequenceNumber');
        
      if (latestEvent && latestEvent.sequenceNumber === this.lastSequenceNumber) {
        return this.cachedState;
      }
    }

    // Load all events
    const events = await HandEvent
      .find({ handId: this.handId })
      .sort({ sequenceNumber: 1 })
      .lean();

    // Start with initial state
    let state = this.engine.getInitialState();
    
    // Apply each event
    for (const event of events) {
      const engineEvent: EngineEvent = {
        type: event.eventType as EventType,
        data: event.eventData,
        timestamp: event.timestamp
      };
      
      state = this.engine.transition(engineEvent);
    }
    
    // Cache the state
    this.cachedState = state;
    this.lastSequenceNumber = events.length > 0 ? events[events.length - 1].sequenceNumber : -1;
    
    return state;
  }

  /**
   * Get valid actions for the current state
   * This method PREVENTS the "check when facing bet" bug
   */
  async getValidActions(): Promise<ActionType[]> {
    const state = await this.rebuildState();
    return this.getValidActionsForState(state);
  }

  /**
   * Get valid actions for a specific state
   */
  private getValidActionsForState(state: EngineState): ActionType[] {
    const validActions: ActionType[] = [];
    
    // Get current player
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.folded || state.isHandComplete) {
      return [];
    }

    // Always can fold (unless already folded)
    validActions.push(ActionType.FOLD);

    const toCall = state.currentBet - currentPlayer.bet;

    // Check/Call logic
    if (toCall === 0) {
      validActions.push(ActionType.CHECK);
    } else if (toCall < currentPlayer.stack) {
      validActions.push(ActionType.CALL);
    }

    // Bet/Raise logic
    if (state.currentBet === 0 && currentPlayer.stack > 0) {
      validActions.push(ActionType.BET);
    } else if (state.currentBet > 0 && currentPlayer.stack > toCall) {
      validActions.push(ActionType.RAISE);
    }

    // All-in is valid if player has chips
    if (currentPlayer.stack > 0) {
      validActions.push(ActionType.ALL_IN);
    }

    return validActions;
  }

  /**
   * Validate if an action is currently valid
   */
  async isActionValid(action: ActionType, amount?: number): Promise<boolean> {
    const validActions = await this.getValidActions();
    
    if (!validActions.includes(action)) {
      return false;
    }

    // Additional validation for bet/raise amounts
    if (action === ActionType.BET || action === ActionType.RAISE) {
      const state = await this.rebuildState();
      const currentPlayer = state.players[state.currentPlayerIndex];
      
      if (!amount || amount <= 0) return false;
      if (amount > currentPlayer.stack) return false;
      
      // Check minimum raise
      if (action === ActionType.RAISE && amount < state.minimumRaise) {
        return false;
      }
    }

    return true;
  }

  /**
   * Process a command and create an event if valid
   */
  async processCommand(playerId: string, action: ActionType, amount?: number): Promise<{
    success: boolean;
    event?: IHandEvent;
    error?: string;
    validActions?: ActionType[];
  }> {
    // Validate action
    const validActions = await this.getValidActions();
    
    if (!validActions.includes(action)) {
      return {
        success: false,
        error: `Invalid action: ${action}. Valid actions: ${validActions.join(', ')}`,
        validActions
      };
    }

    // Create engine event
    const engineEvent: EngineEvent = {
      type: EventType.ACTION_TAKEN,
      data: {
        playerId,
        action,
        amount
      },
      timestamp: new Date()
    };

    try {
      // Process through engine to validate
      const state = await this.rebuildState();
      const newState = this.engine.transition(engineEvent);
      
      // If we got here, action is valid - persist it
      const event = await this.persistEvent(engineEvent);
      
      return {
        success: true,
        event,
        validActions: this.getValidActionsForState(newState)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        validActions
      };
    }
  }

  /**
   * Get all events for replay functionality
   */
  async getEvents(): Promise<IHandEvent[]> {
    return await HandEvent
      .find({ handId: this.handId })
      .sort({ sequenceNumber: 1 })
      .lean();
  }

  /**
   * Replay events up to a specific sequence number
   */
  async replayToSequence(targetSequence: number): Promise<EngineState> {
    const events = await HandEvent
      .find({ 
        handId: this.handId,
        sequenceNumber: { $lte: targetSequence }
      })
      .sort({ sequenceNumber: 1 })
      .lean();

    let state = this.engine.getInitialState();
    
    for (const event of events) {
      const engineEvent: EngineEvent = {
        type: event.eventType as EventType,
        data: event.eventData,
        timestamp: event.timestamp
      };
      
      state = this.engine.transition(engineEvent);
    }
    
    return state;
  }
}
```

---

## PHASE 3: Update Poker Engine

### Context
We need to modify the existing poker engine to emit events without breaking current functionality.

### Implementation Task

**Update `src/poker-engine/core/engine.ts`:**

Add event listener support to your existing PokerStateMachine:

```typescript
export class PokerStateMachine {
  // Add event listener array
  private eventListeners: ((event: EngineEvent) => void | Promise<void>)[] = [];

  // Add method to register event listeners
  onEvent(listener: (event: EngineEvent) => void | Promise<void>): void {
    this.eventListeners.push(listener);
  }

  // Remove listener
  offEvent(listener: (event: EngineEvent) => void | Promise<void>): void {
    this.eventListeners = this.eventListeners.filter(l => l !== listener);
  }

  // Emit event to all listeners
  private async emitEvent(event: EngineEvent): Promise<void> {
    for (const listener of this.eventListeners) {
      try {
        await listener(event);
      } catch (error) {
        console.error('Event listener error:', error);
      }
    }
  }

  // Update your existing transition method
  transition(event: EngineEvent): EngineState {
    // Your existing transition logic
    const newState = this.processEvent(event);
    
    // Emit event to listeners (including EventSourcingAdapter)
    // Use setImmediate to avoid blocking state transition
    setImmediate(() => this.emitEvent(event));
    
    return newState;
  }

  // Add method to get valid actions without transitioning
  getValidActionsForState(state: EngineState): ActionType[] {
    // This should contain your existing validation logic
    // but without modifying state
    const validActions: ActionType[] = [];
    
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.folded) {
      return [];
    }

    // Your existing validation logic here
    // ...
    
    return validActions;
  }
}
```

---

## PHASE 4: Zustand Store Integration

### Context
The Zustand store needs to use event sourcing as the source of truth for all state.

### Implementation Task

**Update `src/stores/poker-hand-store.ts`:**

```typescript
import { EventSourcingAdapter } from '@/poker-engine/adapters/EventSourcingAdapter';
import { HandEvent, IHandEvent } from '@/models/HandEvent';
import { ActionType } from '@/poker-engine/core/actions';

interface PokerHandStore {
  // ... existing state ...
  
  // Add event sourcing fields
  eventAdapter: EventSourcingAdapter | null;
  handEvents: IHandEvent[];
  currentEventIndex: number;
  isReplaying: boolean;
  
  // Replace existing action methods with event-sourced versions
  initializeWithEventSourcing: (handId: string) => Promise<void>;
  processAction: (slotId: string, action: ActionType, amount?: number) => Promise<boolean>;
  getValidActionsForCurrentPlayer: () => Promise<ActionType[]>;
  
  // New replay functionality
  loadEventsForReplay: () => Promise<void>;
  replayToEvent: (eventIndex: number) => Promise<void>;
  replayNext: () => Promise<void>;
  replayPrevious: () => Promise<void>;
}

export const usePokerHandStore = create<PokerHandStore>((set, get) => ({
  // ... existing state ...
  
  eventAdapter: null,
  handEvents: [],
  currentEventIndex: -1,
  isReplaying: false,

  initializeWithEventSourcing: async (handId) => {
    const adapter = new EventSourcingAdapter(handId);
    
    // Set up event listener on engine
    const { engine } = get();
    if (engine) {
      engine.onEvent(async (event) => {
        // This will be called whenever engine processes an event
        await adapter.persistEvent(event);
        
        // Update local event list
        const events = await adapter.getEvents();
        set({ handEvents: events });
      });
    }
    
    // Load existing events
    const events = await adapter.getEvents();
    const state = await adapter.rebuildState();
    
    set({ 
      eventAdapter: adapter,
      handEvents: events,
      engineState: state,
      currentEventIndex: events.length - 1
    });
  },

  processAction: async (slotId, action, amount) => {
    const { eventAdapter, engine } = get();
    
    if (!eventAdapter || !engine) {
      console.error('Event adapter or engine not initialized');
      return false;
    }

    // Get player ID from slot
    const slot = get().getSlotById(slotId);
    if (!slot) return false;

    // Process through event sourcing adapter
    const result = await eventAdapter.processCommand(
      slot.playerId,
      action,
      amount
    );

    if (!result.success) {
      console.error('Action failed:', result.error);
      // Could show error toast here
      return false;
    }

    // Update state from rebuilt events
    const newState = await eventAdapter.rebuildState();
    set({ 
      engineState: newState,
      handEvents: await eventAdapter.getEvents()
    });

    return true;
  },

  getValidActionsForCurrentPlayer: async () => {
    const { eventAdapter } = get();
    
    if (!eventAdapter) {
      return [];
    }

    return await eventAdapter.getValidActions();
  },

  loadEventsForReplay: async () => {
    const { eventAdapter } = get();
    if (!eventAdapter) return;

    const events = await eventAdapter.getEvents();
    set({ 
      handEvents: events,
      isReplaying: true,
      currentEventIndex: 0
    });
  },

  replayToEvent: async (eventIndex) => {
    const { eventAdapter, handEvents } = get();
    if (!eventAdapter || eventIndex < 0 || eventIndex >= handEvents.length) return;

    const state = await eventAdapter.replayToSequence(handEvents[eventIndex].sequenceNumber);
    
    set({ 
      engineState: state,
      currentEventIndex: eventIndex
    });
  },

  replayNext: async () => {
    const { currentEventIndex, handEvents } = get();
    if (currentEventIndex < handEvents.length - 1) {
      await get().replayToEvent(currentEventIndex + 1);
    }
  },

  replayPrevious: async () => {
    const { currentEventIndex } = get();
    if (currentEventIndex > 0) {
      await get().replayToEvent(currentEventIndex - 1);
    }
  }
}));
```

---

## PHASE 5: API Routes

### Context
Create API endpoints that use event sourcing for all poker actions.

### Implementation Task

**Create `app/api/hands/[id]/command/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { SharedHand } from '@/models/SharedHand';
import { EventSourcingAdapter } from '@/poker-engine/adapters/EventSourcingAdapter';
import { ActionType } from '@/poker-engine/core/actions';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    await connectDB();

    // Parse request
    const { action, amount, playerId } = await request.json();

    // Validate input
    if (!action || !playerId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Load hand
    const hand = await SharedHand.findById(params.id);
    if (!hand) {
      return NextResponse.json(
        { success: false, error: 'Hand not found' }, 
        { status: 404 }
      );
    }

    // Check permissions (user must be creator or participant)
    const userCanEdit = hand.createdBy.toString() === session.user.id ||
                       hand.players.some(p => p.userId === session.user.id);
    
    if (!userCanEdit) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' }, 
        { status: 403 }
      );
    }

    // Process command through event sourcing
    const adapter = new EventSourcingAdapter(params.id);
    const result = await adapter.processCommand(
      playerId,
      action as ActionType,
      amount
    );

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          validActions: result.validActions 
        }, 
        { status: 400 }
      );
    }

    // Return success with new valid actions
    return NextResponse.json({
      success: true,
      event: {
        id: result.event._id,
        type: result.event.eventType,
        sequenceNumber: result.event.sequenceNumber
      },
      validActions: result.validActions,
      message: 'Action processed successfully'
    });

  } catch (error) {
    console.error('Command processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
```

**Create `app/api/hands/[id]/events/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { HandEvent } from '@/models/HandEvent';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Get query params for pagination
    const { searchParams } = new URL(request.url);
    const fromSequence = parseInt(searchParams.get('fromSequence') || '0');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Load events
    const events = await HandEvent
      .find({ 
        handId: params.id,
        sequenceNumber: { $gte: fromSequence }
      })
      .sort({ sequenceNumber: 1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        events,
        count: events.length,
        lastSequence: events.length > 0 ? events[events.length - 1].sequenceNumber : -1
      }
    });

  } catch (error) {
    console.error('Events fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
```

**Create `app/api/hands/[id]/valid-actions/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { EventSourcingAdapter } from '@/poker-engine/adapters/EventSourcingAdapter';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const adapter = new EventSourcingAdapter(params.id);
    const validActions = await adapter.getValidActions();
    const state = await adapter.rebuildState();

    return NextResponse.json({
      success: true,
      data: {
        validActions,
        currentPlayer: state.players[state.currentPlayerIndex],
        currentBet: state.currentBet,
        pot: state.pot,
        street: state.street
      }
    });

  } catch (error) {
    console.error('Valid actions fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
```

---

## PHASE 6: UI Integration

### Context
Update UI components to only show valid actions from event sourcing.

### Implementation Task

**Update `app/share-hand/components/poker-table/PlayerActionDialog.tsx`:**

```typescript
import { useEffect, useState } from 'react';
import { ActionType } from '@/poker-engine/core/actions';
import { usePokerHandStore } from '@/stores/poker-hand-store';

export function PlayerActionDialog({ 
  slot, 
  onAction,
  handId 
}: {
  slot: any;
  onAction: (action: ActionType, amount?: number) => void;
  handId: string;
}) {
  const store = usePokerHandStore();
  const [validActions, setValidActions] = useState<ActionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState(0);

  // Fetch valid actions whenever dialog opens or state changes
  useEffect(() => {
    async function fetchValidActions() {
      setLoading(true);
      try {
        // Use store method that queries event sourcing
        const actions = await store.getValidActionsForCurrentPlayer();
        setValidActions(actions);
      } catch (error) {
        console.error('Failed to fetch valid actions:', error);
        setValidActions([]);
      } finally {
        setLoading(false);
      }
    }

    if (slot.isActive) {
      fetchValidActions();
    }
  }, [slot.isActive, store.engineState]); // Re-fetch when engine state changes

  const handleAction = async (action: ActionType) => {
    setLoading(true);
    
    const amount = (action === ActionType.BET || action === ActionType.RAISE) 
      ? betAmount 
      : undefined;

    const success = await store.processAction(slot.id, action, amount);
    
    if (success) {
      onAction(action, amount);
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <Dialog open={slot.isActive}>
        <DialogContent>
          <div className="flex items-center justify-center p-8">
            <Spinner />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={slot.isActive}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your Turn to Act</DialogTitle>
          <DialogDescription>
            Pot: ${store.engineState?.pot || 0} | 
            To Call: ${store.engineState?.currentBet || 0}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {/* Only show buttons for valid actions */}
          {validActions.includes(ActionType.FOLD) && (
            <Button 
              variant="destructive" 
              onClick={() => handleAction(ActionType.FOLD)}
            >
              Fold
            </Button>
          )}

          {validActions.includes(ActionType.CHECK) && (
            <Button 
              variant="outline" 
              onClick={() => handleAction(ActionType.CHECK)}
            >
              Check
            </Button>
          )}

          {validActions.includes(ActionType.CALL) && (
            <Button 
              variant="default" 
              onClick={() => handleAction(ActionType.CALL)}
            >
              Call ${store.engineState?.currentBet || 0}
            </Button>
          )}

          {validActions.includes(ActionType.BET) && (
            <div className="col-span-2">
              <Label>Bet Amount</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  min={store.engineState?.minimumBet || 0}
                  max={slot.player?.stack || 0}
                />
                <Button onClick={() => handleAction(ActionType.BET)}>
                  Bet
                </Button>
              </div>
            </div>
          )}

          {validActions.includes(ActionType.RAISE) && (
            <div className="col-span-2">
              <Label>Raise Amount</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  min={store.engineState?.minimumRaise || 0}
                  max={slot.player?.stack || 0}
                />
                <Button onClick={() => handleAction(ActionType.RAISE)}>
                  Raise
                </Button>
              </div>
            </div>
          )}

          {validActions.includes(ActionType.ALL_IN) && (
            <Button 
              variant="default" 
              className="col-span-2"
              onClick={() => handleAction(ActionType.ALL_IN)}
            >
              All In (${slot.player?.stack || 0})
            </Button>
          )}
        </div>

        {validActions.length === 0 && (
          <p className="text-center text-muted-foreground mt-4">
            No valid actions available
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

**Create `app/share-hand/components/ReplayControls.tsx`:**

```typescript
import { useState, useEffect } from 'react';
import { usePokerHandStore } from '@/stores/poker-hand-store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

export function ReplayControls({ handId }: { handId: string }) {
  const store = usePokerHandStore();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Load events when component mounts
    store.loadEventsForReplay();
  }, [handId]);

  useEffect(() => {
    if (isPlaying && store.currentEventIndex < store.handEvents.length - 1) {
      const timer = setTimeout(() => {
        store.replayNext();
      }, 1000); // 1 second between events

      return () => clearTimeout(timer);
    } else if (isPlaying && store.currentEventIndex >= store.handEvents.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, store.currentEventIndex, store.handEvents.length]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    store.replayToEvent(value[0]);
  };

  if (!store.isReplaying || store.handEvents.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card border rounded-lg p-4 shadow-lg w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Hand Replay</h3>
        <span className="text-sm text-muted-foreground">
          Event {store.currentEventIndex + 1} of {store.handEvents.length}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Button
          size="icon"
          variant="outline"
          onClick={() => store.replayToEvent(0)}
          disabled={store.currentEventIndex === 0}
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={() => store.replayPrevious()}
          disabled={store.currentEventIndex === 0}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant="default"
          onClick={handlePlayPause}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        <Button
          size="icon"
          variant="outline"
          onClick={() => store.replayNext()}
          disabled={store.currentEventIndex >= store.handEvents.length - 1}
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <Slider
        value={[store.currentEventIndex]}
        onValueChange={handleSeek}
        max={store.handEvents.length - 1}
        step={1}
        className="w-full"
      />

      {/* Event details */}
      {store.handEvents[store.currentEventIndex] && (
        <div className="mt-4 p-2 bg-muted rounded text-sm">
          <p className="font-medium">
            {store.handEvents[store.currentEventIndex].eventType}
          </p>
          <p className="text-muted-foreground">
            {JSON.stringify(store.handEvents[store.currentEventIndex].eventData)}
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## PHASE 7: Testing

### Context
Create comprehensive tests to ensure event sourcing works correctly.

### Implementation Task

**Create `src/poker-engine/adapters/__tests__/EventSourcingAdapter.test.ts`:**

```typescript
import { EventSourcingAdapter } from '../EventSourcingAdapter';
import { HandEvent } from '@/models/HandEvent';
import { SharedHand } from '@/models/SharedHand';
import { ActionType } from '../../core/actions';
import { setupTestDB, teardownTestDB, clearTestDB } from '@/test/utils';

describe('EventSourcingAdapter', () => {
  let adapter: EventSourcingAdapter;
  let handId: string;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    
    // Create a test hand
    const hand = await SharedHand.create({
      title: 'Test Hand',
      gameType: 'NLH',
      stakes: '1/2',
      players: [
        { userId: 'player1', position: 'BTN', startingStack: 200 },
        { userId: 'player2', position: 'SB', startingStack: 200 },
        { userId: 'player3', position: 'BB', startingStack: 200 }
      ]
    });
    
    handId = hand._id.toString();
    adapter = new EventSourcingAdapter(handId);
  });

  describe('Event Persistence', () => {
    it('should persist events with correct sequence numbers', async () => {
      const event1 = {
        type: 'HAND_INITIALIZED',
        data: { players: ['p1', 'p2', 'p3'] }
      };

      const event2 = {
        type: 'BLINDS_POSTED',
        data: { smallBlind: 1, bigBlind: 2 }
      };

      await adapter.persistEvent(event1);
      await adapter.persistEvent(event2);

      const events = await HandEvent.find({ handId }).sort({ sequenceNumber: 1 });
      
      expect(events).toHaveLength(2);
      expect(events[0].sequenceNumber).toBe(0);
      expect(events[1].sequenceNumber).toBe(1);
    });

    it('should handle concurrent event persistence', async () => {
      // Test that sequence numbers are assigned correctly even with concurrent writes
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          adapter.persistEvent({
            type: 'ACTION_TAKEN',
            data: { action: 'fold', playerId: `p${i}` }
          })
        );
      }

      await Promise.all(promises);

      const events = await HandEvent.find({ handId }).sort({ sequenceNumber: 1 });
      expect(events).toHaveLength(10);
      
      // Check sequence numbers are consecutive
      events.forEach((event, index) => {
        expect(event.sequenceNumber).toBe(index);
      });
    });
  });

  describe('State Rebuilding', () => {
    it('should rebuild state from events correctly', async () => {
      // Persist some events
      await adapter.persistEvent({
        type: 'HAND_INITIALIZED',
        data: { 
          players: [
            { id: 'p1', stack: 200 },
            { id: 'p2', stack: 200 }
          ]
        }
      });

      await adapter.persistEvent({
        type: 'BLINDS_POSTED',
        data: { smallBlind: 1, bigBlind: 2 }
      });

      await adapter.persistEvent({
        type: 'ACTION_TAKEN',
        data: { playerId: 'p1', action: 'raise', amount: 10 }
      });

      const state = await adapter.rebuildState();
      
      expect(state).toBeDefined();
      expect(state.pot).toBeGreaterThan(0);
      expect(state.currentBet).toBe(10);
    });
  });

  describe('Valid Actions', () => {
    it('should prevent check when facing bet', async () => {
      // Initialize hand
      await adapter.persistEvent({
        type: 'HAND_INITIALIZED',
        data: { 
          players: [
            { id: 'p1', stack: 200, position: 0 },
            { id: 'p2', stack: 200, position: 1 }
          ]
        }
      });

      // Player 1 bets
      await adapter.persistEvent({
        type: 'ACTION_TAKEN',
        data: { playerId: 'p1', action: 'bet', amount: 10 }
      });

      // Get valid actions for player 2
      const validActions = await adapter.getValidActions();
      
      expect(validActions).not.toContain(ActionType.CHECK);
      expect(validActions).toContain(ActionType.FOLD);
      expect(validActions).toContain(ActionType.CALL);
      expect(validActions).toContain(ActionType.RAISE);
    });

    it('should allow check when no bet to call', async () => {
      // Initialize hand
      await adapter.persistEvent({
        type: 'HAND_INITIALIZED',
        data: { 
          players: [
            { id: 'p1', stack: 200, position: 0 },
            { id: 'p2', stack: 200, position: 1 }
          ]
        }
      });

      const validActions = await adapter.getValidActions();
      
      expect(validActions).toContain(ActionType.CHECK);
      expect(validActions).toContain(ActionType.BET);
      expect(validActions).not.toContain(ActionType.CALL);
    });
  });

  describe('Command Processing', () => {
    it('should process valid commands', async () => {
      await adapter.persistEvent({
        type: 'HAND_INITIALIZED',
        data: { 
          players: [
            { id: 'p1', stack: 200, position: 0 },
            { id: 'p2', stack: 200, position: 1 }
          ]
        }
      });

      const result = await adapter.processCommand('p1', ActionType.BET, 10);
      
      expect(result.success).toBe(true);
      expect(result.event).toBeDefined();
      expect(result.validActions).toBeDefined();
    });

    it('should reject invalid commands', async () => {
      await adapter.persistEvent({
        type: 'HAND_INITIALIZED',
        data: { 
          players: [
            { id: 'p1', stack: 200, position: 0 },
            { id: 'p2', stack: 200, position: 1 }
          ]
        }
      });

      // P1 bets
      await adapter.processCommand('p1', ActionType.BET, 10);

      // P2 tries to check (invalid)
      const result = await adapter.processCommand('p2', ActionType.CHECK);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid action');
      expect(result.validActions).not.toContain(ActionType.CHECK);
    });
  });

  describe('Replay Functionality', () => {
    it('should replay to specific sequence', async () => {
      // Create multiple events
      const events = [
        { type: 'HAND_INITIALIZED', data: { players: ['p1', 'p2'] } },
        { type: 'BLINDS_POSTED', data: { smallBlind: 1, bigBlind: 2 } },
        { type: 'ACTION_TAKEN', data: { playerId: 'p1', action: 'bet', amount: 10 } },
        { type: 'ACTION_TAKEN', data: { playerId: 'p2', action: 'call', amount: 10 } }
      ];

      for (const event of events) {
        await adapter.persistEvent(event);
      }

      // Replay to sequence 2 (after blinds, before first action)
      const state = await adapter.replayToSequence(1);
      
      expect(state.pot).toBe(3); // Just blinds
      expect(state.currentBet).toBe(2); // Big blind
    });
  });
});
```

---

## Implementation Order and Timeline

### Day 1-2: Database Layer
1. Create HandEvent model
2. Update SharedHand model
3. Test database operations

### Day 3-4: Event Sourcing Infrastructure
1. Create EventSourcingAdapter
2. Create repository layer
3. Test event persistence and replay

### Day 5-6: Engine Integration
1. Update PokerStateMachine with event emission
2. Ensure backward compatibility
3. Test engine with event sourcing

### Day 7-8: State Management
1. Update Zustand store
2. Integrate with EventSourcingAdapter
3. Test state synchronization

### Day 9-10: API Routes
1. Create command processing endpoint
2. Create event query endpoints
3. Test API with various scenarios

### Day 11-12: UI Integration
1. Update PlayerActionDialog
2. Create ReplayControls
3. Test UI with event sourcing

### Day 13-14: Testing and Polish
1. Run comprehensive tests
2. Fix any edge cases
3. Performance optimization
4. Documentation

---

## Key Success Metrics

1. **Bug Prevention**: The "check when facing bet" bug should be impossible
2. **State Consistency**: UI and engine state always match
3. **Perfect Replay**: Any hand can be replayed exactly
4. **Performance**: State rebuilding < 50ms for typical hands
5. **Reliability**: Zero state corruption issues

---

## Common Pitfalls to Avoid

1. **Don't modify events after creation** - They are immutable
2. **Always use transactions** when saving events to ensure consistency
3. **Don't trust client state** - Always rebuild from events
4. **Handle concurrent access** - Use optimistic concurrency control
5. **Cache carefully** - Invalid caches cause bugs

---

## Final Notes for Implementation

This implementation completely solves your state management issues by making events the single source of truth. The UI can only show actions that are valid according to the rebuilt state, making bugs like "check when facing bet" impossible.

Remember:
- Start with the database layer and work up
- Test each layer thoroughly before moving on
- The event stream is sacred - never modify past events
- When in doubt, rebuild state from events

Good luck with the implementation! The architecture is sound and will eliminate your state consistency bugs.