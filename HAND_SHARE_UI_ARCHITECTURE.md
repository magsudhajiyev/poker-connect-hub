# Hand Share UI Architecture

## Overview

The Hand Share feature allows users to recreate and share poker hands with the community. It uses a multi-step form wizard that guides users through hand setup, actions, and analysis.

## Architecture Components

### 1. Core State Management

#### ShareHandProvider (`/app/share-hand/components/ShareHandProvider.tsx`)

- **Purpose**: Central context provider that manages the integration between UI and poker engine
- **Key Responsibilities**:
  - Wraps `useShareHandLogic` for form state management
  - Wraps `useHandBuilder` for poker engine state management
  - Initializes the poker game when moving to action steps
  - Processes actions through the poker engine
  - Syncs engine state with form data

#### useShareHandLogic (`/src/hooks/useShareHandLogic.ts`)

- **Purpose**: Manages form data and step navigation
- **State**:
  - `formData`: Complete form state including players, cards, actions
  - `currentStep`: Current wizard step (0-6)
  - `tags`, `isLoading`, `error`: UI state
- **Key Methods**:
  - `nextStep()`: Advances to next form step
  - `prevStep()`: Goes back to previous step
  - `handleSubmit()`: Submits the completed hand

### 2. Poker Engine Integration

#### useHandBuilder (`/src/poker-engine/hooks/useHandBuilder.ts`)

- **Purpose**: React hook wrapper around the poker engine
- **Key Methods**:
  - `initializeHand(players)`: Sets up a new hand with players
  - `processAction(playerId, action, amount)`: Processes a poker action
  - `dealCards()`: Deals hole/community cards
  - `getCurrentState()`: Returns current engine state
  - `currentPlayer`, `legalActions`: Computed values from engine

#### HandBuilderService (`/src/poker-engine/services/builder.ts`)

- **Purpose**: Service layer that wraps the core poker engine
- **Manages**: Event creation, validation, and application

#### PokerHandEngine (`/src/poker-engine/core/engine.ts`)

- **Purpose**: Core state machine for poker hand logic
- **Features**:
  - Event-sourced architecture
  - Automatic street advancement
  - Legal action calculation
  - Betting round completion detection

### 3. UI Flow

#### Step Navigation

1. **Game Setup** (Step 0): Game type, format, blinds
2. **Positions** (Step 1): Player positions and stack sizes
3. **Preflop Actions** (Step 2): Hero cards and preflop betting
4. **Flop** (Step 3): Flop cards and actions
5. **Turn** (Step 4): Turn card and actions
6. **River** (Step 5): River card and actions
7. **Summary** (Step 6): Title, description, tags

#### Action Flow Component (`/app/share-hand/components/ActionFlow.tsx`)

- **Purpose**: Renders action buttons and manages action selection
- **Key Logic**:
  ```typescript
  const handleActionClick = (actionStep, index, action) => {
    if (isGameInitialized && currentPlayer && actionStep.playerId === currentPlayer.id) {
      // Use poker engine for validation and processing
      processEngineAction(actionStep.playerId, actionType, amount);
    } else {
      // Legacy fallback
      updateAction(street, index, action);
    }
  };
  ```

### 4. Data Flow

#### When User Selects an Action:

1. **User clicks action button** in ActionFlow component
2. **ActionFlow.handleActionClick()** is called:
   - Validates if game is initialized
   - Checks if action is legal via `legalActions`
   - Calls `processAction()` from ShareHandProvider
3. **ShareHandProvider.processAction()** executes:
   - Calls `handBuilder.processAction()`
   - Shows toast if action is invalid
   - Updates form data with new action
4. **HandBuilder** processes through engine:
   - Validates action
   - Creates ActionTakenEvent
   - Updates engine state
   - Triggers automatic transitions
5. **UI Updates**:
   - Engine state changes trigger re-renders
   - Current player indicator updates
   - Legal actions recalculate

### 5. Current Issues

#### Action Steps Generation

- **Problem**: Actions array starts empty, no action slots are pre-generated
- **Impact**: UI doesn't know which players should act when
- **Missing**: Function to generate action sequence based on player positions

#### State Synchronization

- **Problem**: After processing an action, the UI adds a new action instead of updating existing
- **Impact**: Action indicator stays on the same player
- **Cause**: Form data structure expects pre-populated action slots

#### Expected Flow:

1. When transitioning from Positions (Step 1) to Preflop (Step 2):
   - Should generate action steps for all players in position order
   - Each step should have: `playerId`, `playerName`, `position`, `isHero`, `action: null`
2. When user selects an action:
   - Update the existing action step (not add new)
   - Move indicator to next player
   - Show only legal actions for that player

### 6. Key Interfaces

```typescript
interface ActionStep {
  playerId: string;
  playerName: string;
  position: string;
  isHero: boolean;
  action: string | null;
  betAmount?: string;
  completed: boolean;
}

interface ShareHandFormData {
  players: Player[];
  preflopActions: ActionStep[];
  flopActions: ActionStep[];
  turnActions: ActionStep[];
  riverActions: ActionStep[];
  // ... other fields
}
```

### 7. Component Hierarchy

```
ShareHandPage
└── ShareHandProvider (Context)
    ├── ShareHandStepper (Progress indicator)
    ├── ShareHandForm (Main form container)
    │   ├── GameSetupForm
    │   ├── PositionsForm
    │   ├── PreflopForm
    │   │   └── ActionFlow
    │   │       └── ActionStepCard
    │   │           ├── ActionButtons
    │   │           └── BetInputSection
    │   ├── FlopForm
    │   ├── TurnForm
    │   ├── RiverForm
    │   └── SummaryForm
    └── ShareHandNavigation (Next/Previous buttons)
```

### 8. State Machine Integration

The poker engine uses an event-sourced state machine that:

- Validates all actions before applying
- Automatically advances streets when betting completes
- Calculates legal actions based on current state
- Maintains complete event history for replay

This architecture ensures game rules are enforced while keeping the UI responsive and user-friendly.
