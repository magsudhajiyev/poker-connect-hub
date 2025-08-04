import { PokerEvent, ActionTakenEvent } from '../core/events';
import { HandState } from '../core/state';
import { PokerHandEngine } from '../core/engine';
import { HandEvent, IHandEvent } from '@/models/HandEvent';
import { SharedHand } from '@/models/SharedHand';
// MongoDB connection is handled by Mongoose in test environment
import { ActionType } from '@/types/poker';
import mongoose from 'mongoose';

// Map our PokerEvent types to the string enum used in HandEvent
type EventTypeString =
  | 'HAND_INITIALIZED'
  | 'BLINDS_POSTED'
  | 'ACTION_TAKEN'
  | 'STREET_COMPLETED'
  | 'HAND_COMPLETED';

// Wrapper interface to match what the store expects
export interface EngineState {
  currentState: HandState;
  events: PokerEvent[];
}

export class EventSourcingAdapter {
  private engine: PokerHandEngine | null = null;
  private handId: string;
  private cachedState: EngineState | null = null;
  private lastSequenceNumber: number = -1;
  private gameConfig: any = null;
  private isReplaying: boolean = false;
  private persistenceLock: Promise<any> = Promise.resolve();

  constructor(handId: string) {
    // Validate handId format on construction
    if (!handId || typeof handId !== 'string') {
      throw new Error('HandId must be a non-empty string');
    }

    // Trim any whitespace
    this.handId = handId.trim();

    // Log for debugging

    // Engine will be initialized when we have game config
  }

  /**
   * Convert PokerEvent to a format suitable for persistence
   */
  private mapEventForPersistence(event: PokerEvent): {
    eventType: EventTypeString;
    eventData: Record<string, any>;
    playerId?: string;
  } {
    const baseData = {
      eventType: event.type as EventTypeString,
      eventData: event.data,
      playerId: undefined as string | undefined,
    };

    // Extract playerId based on event type
    if (event.type === 'ACTION_TAKEN') {
      baseData.playerId = (event as ActionTakenEvent).data.playerId;
    }

    return baseData;
  }

  /**
   * Persist an engine event to the database
   * This is called after the engine processes an action
   */
  async persistEvent(event: PokerEvent): Promise<IHandEvent> {
    // Use a lock to prevent concurrent persistence of events
    return (this.persistenceLock = this.persistenceLock.then(async () => {
      // MongoDB connection is already established in test environment

      // Get the next sequence number
      const hand = await SharedHand.findById(this.handId);
      if (!hand) {
        throw new Error(`Hand ${this.handId} not found`);
      }

      const sequenceNumber = hand.lastEventSequence + 1;

      // Map the event for persistence
      const mappedEvent = this.mapEventForPersistence(event);

      // Create the event document
      const handEvent = new HandEvent({
        handId: new mongoose.Types.ObjectId(this.handId),
        eventType: mappedEvent.eventType,
        eventData: mappedEvent.eventData,
        eventVersion: 1,
        sequenceNumber,
        timestamp: event.timestamp || new Date(),
        playerId: mappedEvent.playerId,
        metadata: {
          // Store state for debugging
          engineStateBefore: this.cachedState,
          validActions: this.cachedState ? this.getValidActionsForState(this.cachedState) : [],
        },
      });

      // Save event and update hand
      // Skip transactions in test environment (MongoDB Memory Server doesn't support them)
      // Also skip in development when using local MongoDB (doesn't support transactions unless configured as replica set)
      if (process.env.NODE_ENV === 'test' || process.env.SKIP_TRANSACTIONS === 'true') {
        await handEvent.save();

        // Update hand with new sequence number using findByIdAndUpdate to avoid version conflicts
        await SharedHand.findByIdAndUpdate(
          this.handId,
          {
            $set: { lastEventSequence: sequenceNumber },
            $push: { events: handEvent._id },
          },
          { new: true },
        );
      } else {
        // Use transaction in production
        const session = await mongoose.startSession();
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
      }

      // Clear cached state
      this.cachedState = null;

      return handEvent;
    }));
  }

  /**
   * Initialize the engine with game config from the first event
   */
  private async initializeEngine(): Promise<void> {
    if (this.engine) {
      return;
    }

    // Validate handId format
    if (!mongoose.Types.ObjectId.isValid(this.handId)) {
      throw new Error(`Invalid handId format: ${this.handId}`);
    }

    // Convert handId to ObjectId
    const handObjectId = new mongoose.Types.ObjectId(this.handId);

    // Get the first event to extract game config
    const initEvent = await HandEvent.findOne({
      handId: handObjectId,
      eventType: 'HAND_INITIALIZED',
    })
      .sort({ sequenceNumber: 1 })
      .lean();

    if (!initEvent) {
      console.error(`No initialization event found for hand ${this.handId}`);

      // Debug: Check if any events exist for this hand
      const eventCount = await HandEvent.countDocuments({ handId: handObjectId });

      if (eventCount > 0) {
        // Log the first few events to see what's there
        await HandEvent.find({ handId: handObjectId }).limit(3).lean();
      }

      // Try to get game config from SharedHand as fallback
      const hand = await SharedHand.findById(this.handId);
      if (!hand) {
        throw new Error(`Hand ${this.handId} not found`);
      }

      // If the hand exists but has no events, it might be a legacy hand
      throw new Error('No initialization event found for hand');
    }

    const eventData = (initEvent as any).eventData as any;
    this.gameConfig = {
      gameType: eventData.gameType,
      gameFormat: eventData.gameFormat,
      blinds: eventData.blinds,
      currency: eventData.currency || 'USD',
    };

    this.engine = new PokerHandEngine(this.gameConfig);

    // Register adapter as event listener to persist automatic events
    this.engine.onEvent(async (event) => {
      // Skip persistence during replay to avoid duplicates
      if (!this.isReplaying) {
        await this.persistEvent(event);
      }
    });
  }

  /**
   * Rebuild the current game state from all events
   * This is the SINGLE SOURCE OF TRUTH
   */
  async rebuildState(): Promise<EngineState> {
    // Ensure engine is initialized
    await this.initializeEngine();

    // Convert handId to ObjectId once
    const handObjectId = new mongoose.Types.ObjectId(this.handId);

    // Check cache first
    if (this.cachedState && this.lastSequenceNumber >= 0) {
      const latestEvent = await HandEvent.findOne({ handId: handObjectId })
        .sort({ sequenceNumber: -1 })
        .select('sequenceNumber');

      if (latestEvent && latestEvent.sequenceNumber === this.lastSequenceNumber) {
        return this.cachedState;
      }
    }

    // Load all events
    const events = await HandEvent.find({ handId: handObjectId })
      .sort({ sequenceNumber: 1 })
      .lean();

    // Convert to PokerEvents
    const pokerEvents: PokerEvent[] = events.map(
      (event: any) =>
        ({
          id: event._id.toString(),
          type: event.eventType,
          data: event.eventData,
          timestamp: event.timestamp,
          version: event.eventVersion,
        }) as any,
    );

    // Set replaying flag to prevent duplicate persistence
    this.isReplaying = true;

    // Create new engine with all events
    this.engine = new PokerHandEngine(this.gameConfig, pokerEvents);

    // Register adapter as event listener to persist automatic events
    this.engine.onEvent(async (event) => {
      // Skip persistence during replay to avoid duplicates
      if (!this.isReplaying) {
        await this.persistEvent(event);
      }
    });

    // Clear replaying flag after engine is created
    this.isReplaying = false;

    // Get current state
    const currentState = this.engine.getCurrentState();

    // Wrap in EngineState
    const engineState: EngineState = {
      currentState,
      events: pokerEvents,
    };

    // Cache the state
    this.cachedState = engineState;
    this.lastSequenceNumber = events.length > 0 ? events[events.length - 1].sequenceNumber : -1;

    return engineState;
  }

  /**
   * Get valid actions for the current state
   * This method PREVENTS the "check when facing bet" bug
   */
  async getValidActions(): Promise<ActionType[]> {
    try {
      const state = await this.rebuildState();
      if (!state) {
        console.error('rebuildState returned null in getValidActions');
        return [];
      }
      return this.getValidActionsForState(state);
    } catch (error) {
      console.error('Error getting valid actions:', error);
      return [];
    }
  }

  /**
   * Get valid actions for a specific state
   */
  private getValidActionsForState(state: EngineState): ActionType[] {
    // Check if state is valid
    if (!state || !state.currentState) {
      console.error('Invalid state in getValidActionsForState:', state);
      return [];
    }

    // Get current player from betting state
    const currentPlayerId = state.currentState.betting.actionOn;
    if (!currentPlayerId || state.currentState.isComplete) {
      return [];
    }

    // Use the engine's getLegalActions method which has all the complex logic
    if (this.engine) {
      const legalActions = this.engine.getLegalActions(currentPlayerId);
      return legalActions.map((action) => action.type);
    }

    // Fallback if engine is not available (shouldn't happen)
    return [];
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
      const currentPlayerId = state.currentState.betting.actionOn;
      if (!currentPlayerId) {
        return false;
      }

      const currentPlayer = state.currentState.players.get(currentPlayerId);
      if (!currentPlayer) {
        return false;
      }

      if (!amount || amount <= 0) {
        return false;
      }
      if (amount > currentPlayer.stackSize) {
        return false;
      }

      // Check minimum raise
      if (action === ActionType.RAISE) {
        const minRaise =
          state.currentState.betting.minRaise ||
          state.currentState.betting.lastRaiseSize ||
          state.currentState.gameConfig.blinds.big;
        if (amount < minRaise) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Process a command and create an event if valid
   */
  async processCommand(
    playerId: string,
    action: ActionType,
    amount?: number,
  ): Promise<{
    success: boolean;
    event?: IHandEvent;
    error?: string;
    validActions?: ActionType[];
  }> {
    // Wait for any pending persistence operations
    await this.persistenceLock;

    // Validate action
    const validActions = await this.getValidActions();

    if (!validActions.includes(action)) {
      return {
        success: false,
        error: `Invalid action: ${action}. Valid actions: ${validActions.join(', ')}`,
        validActions,
      };
    }

    // Get current state
    const state = await this.rebuildState();

    // Verify it's this player's turn
    if (state.currentState.betting.actionOn !== playerId) {
      return {
        success: false,
        error: 'Not your turn',
        validActions: [],
      };
    }

    // Create engine event
    const engineEvent: ActionTakenEvent = {
      id: new mongoose.Types.ObjectId().toString(),
      type: 'ACTION_TAKEN',
      timestamp: new Date(),
      version: 1,
      data: {
        playerId,
        action,
        amount: amount || 0,
        isAllIn: action === ActionType.ALL_IN,
        street: state.currentState.street,
        potBefore: state.currentState.betting.pot,
        potAfter: state.currentState.betting.pot, // Will be calculated by engine
      },
    };

    try {
      // Process through engine to validate
      if (!this.engine) {
        throw new Error('Engine not initialized');
      }

      // Process the event through the engine (this will trigger automatic transitions)
      const result = this.engine.processEvent(engineEvent);

      if (!result.success) {
        return {
          success: false,
          error: result.error?.message || 'Failed to process action',
          validActions,
        };
      }

      // Update pot after in event data
      engineEvent.data.potAfter = result.data.betting.pot;

      // Wait a bit to ensure all events (including automatic) are persisted
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Rebuild state to get the latest (including any automatic events)
      const updatedState = await this.rebuildState();

      // Find the persisted event
      const events = await this.getEvents();
      const persistedEvent = events[events.length - 1]; // Get the last event

      return {
        success: true,
        event: persistedEvent,
        validActions: updatedState ? this.getValidActionsForState(updatedState) : [],
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        validActions,
      };
    }
  }

  /**
   * Get all events for replay functionality
   */
  async getEvents(): Promise<IHandEvent[]> {
    const handObjectId = new mongoose.Types.ObjectId(this.handId);
    return (await HandEvent.find({ handId: handObjectId })
      .sort({ sequenceNumber: 1 })
      .lean()) as any;
  }

  /**
   * Replay events up to a specific sequence number
   */
  async replayToSequence(targetSequence: number): Promise<EngineState> {
    // Ensure engine is initialized
    await this.initializeEngine();

    const handObjectId = new mongoose.Types.ObjectId(this.handId);
    const events = await HandEvent.find({
      handId: handObjectId,
      sequenceNumber: { $lte: targetSequence },
    })
      .sort({ sequenceNumber: 1 })
      .lean();

    // Convert to PokerEvents
    const pokerEvents: PokerEvent[] = events.map(
      (event: any) =>
        ({
          id: event._id.toString(),
          type: event.eventType,
          data: event.eventData,
          timestamp: event.timestamp,
          version: event.eventVersion,
        }) as any,
    );

    // Set replaying flag to prevent duplicate persistence
    this.isReplaying = true;

    // Create new engine with events up to target
    this.engine = new PokerHandEngine(this.gameConfig, pokerEvents);

    // Register adapter as event listener to persist automatic events
    this.engine.onEvent(async (event) => {
      // Skip persistence during replay to avoid duplicates
      if (!this.isReplaying) {
        await this.persistEvent(event);
      }
    });

    // Clear replaying flag after engine is created
    this.isReplaying = false;

    // Get current state
    const currentState = this.engine.getCurrentState();

    // Wrap in EngineState
    return {
      currentState,
      events: pokerEvents,
    };
  }

  /**
   * Reset the adapter (useful for testing)
   */
  reset(): void {
    this.cachedState = null;
    this.lastSequenceNumber = -1;
    this.engine = null;
    this.gameConfig = null;
  }
}
