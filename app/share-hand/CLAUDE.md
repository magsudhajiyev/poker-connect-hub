# Share Hand Directory

## Overview

Multi-step wizard for creating and sharing poker hands. Implements a complex form flow with real-time poker game simulation.

## Core Components

### Main Page (`page.tsx`)

- Entry point for hand sharing
- Sets up providers and context
- Handles authentication check

### ShareHandForm (`components/ShareHandForm.tsx`)

- Main form orchestrator
- Step navigation logic
- Form state management
- Progress tracking

### ShareHandProvider (`components/ShareHandProvider.tsx`)

- **Central state management** for the entire hand sharing flow
- Integrates with poker engine
- Synchronizes UI state with game state
- Provides context for all child components

## Step Components

### 1. GameSetupStep

- Game format selection (Cash/Tournament)
- Blind structure
- Currency selection
- Stack sizes

### 2. PositionsStep

- Player seat selection
- Position assignment (BTN, SB, BB, etc.)
- Hero designation
- Stack size input

### 3. PreflopStep

- Hole cards input
- Preflop action sequence
- Blind posting logic
- Action validation

### 4. FlopStep

- Flop cards input
- Post-flop action sequence
- Pot calculation
- Board texture notes

### 5. TurnStep

- Turn card input
- Turn actions
- Running pot updates

### 6. RiverStep

- River card input
- Final actions
- Showdown logic

### 7. ReviewStep

- Hand summary
- Title and description
- Tags selection
- Publish to community

## Poker Table Components (`components/poker-table/`)

### Core Table Components

- **PokerTable.tsx** - Main table layout and seat positioning
- **ClickablePlayerSeat.tsx** - Interactive seat component
- **PlayerSeatDisplayOptimized.tsx** - Optimized player display with stack updates
- **PlayerActionDialog.tsx** - Action selection interface

### Supporting Components

- **CommunityCardsOptimized.tsx** - Board card display
- **PotDisplayOptimized.tsx** - Pot size display
- **DealerButton.tsx** - Dealer position indicator
- **BettingInterface.tsx** - Bet sizing controls

### Hooks

- **usePlayerActionDialog.ts** - Action dialog state management
- **usePokerGameEngine.ts** - Game engine integration

## Key Features

### Real-time Validation

- Actions validated against poker rules
- Prevents invalid moves
- Immediate feedback

### State Synchronization

- UI reflects engine state
- Stack sizes update automatically
- Action history tracking

### Progressive Enhancement

- Works without JavaScript (basic form)
- Enhanced with client-side validation
- Optimistic updates

## Data Flow

1. **User Input** → Form components
2. **Validation** → ShareHandProvider
3. **Engine Update** → Poker engine processes action
4. **State Sync** → UI updates reflect new state
5. **Persistence** → Save to database on publish

## Important Patterns

### Lazy Loading

```typescript
const LazyPokerTable = dynamic(() => import('./poker-table/PokerTable'), { ssr: false });
```

### Context Usage

```typescript
const context = useShareHandContext();
const { processAction, engineState } = context;
```

### Action Processing

```typescript
// Validated action flow
const success = await processAction(playerId, action, amount);
if (success) {
  // Update UI
}
```
