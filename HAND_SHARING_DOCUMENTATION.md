# Hand Sharing System - Comprehensive Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [State Management](#state-management)
5. [Action Flow Logic](#action-flow-logic)
6. [Data Structures](#data-structures)
7. [UI Flow](#ui-flow)
8. [Betting Algorithm](#betting-algorithm)
9. [Common Issues & Solutions](#common-issues--solutions)

## Overview

The Hand Sharing system is a multi-step wizard that allows users to recreate and share poker hands. It manages complex poker game state, betting logic, and player actions across multiple betting streets (preflop, flop, turn, river).

### Key Features

- Multi-step form wizard with 9 steps
- Real-time poker game simulation
- Complex betting logic with all-in scenarios
- Position-based action ordering
- Visual poker table representation
- Action validation and state management

## Architecture

### Component Hierarchy

```
ShareHandPage
├── ShareHandProvider (Context Provider)
│   └── ShareHandForm
│       ├── GameSetupStep
│       ├── PositionsStep
│       ├── PreflopStep
│       │   ├── HoleCardsSelection
│       │   └── ActionStep
│       ├── FlopStep
│       │   ├── CommunityCardsSelection
│       │   └── ActionStep
│       ├── TurnStep
│       │   ├── CommunityCardsSelection
│       │   └── ActionStep
│       ├── RiverStep
│       │   ├── CommunityCardsSelection
│       │   └── ActionStep
│       └── ReviewStep
```

### Key Hooks Architecture

```
useShareHandLogic (Main orchestrator)
├── usePokerEngine (Game state management)
├── useActionFlow (Betting logic)
├── useStepValidation (Form validation)
└── useCardSelection (Card picking)
```

## Core Components

### 1. ShareHandProvider (`/app/share-hand/ShareHandProvider.tsx`)

- **Purpose**: Central context provider that manages all hand sharing state
- **Key Responsibilities**:
  - Form data management
  - Step navigation
  - Poker engine initialization
  - State persistence

### 2. useShareHandLogic Hook (`/src/hooks/useShareHandLogic.ts`)

- **Purpose**: Main business logic orchestrator
- **Key Functions**:
  - `handleNextStep()`: Validates current step and advances
  - `handlePreviousStep()`: Navigates backward
  - `handleActionComplete()`: Processes completed actions
  - `updateFormData()`: Updates form state

### 3. useActionFlow Hook (`/src/hooks/useActionFlow.ts`)

- **Purpose**: Core betting logic and action management
- **Key Functions**:
  - `getCurrentPlayer()`: Determines who should act next
  - `getAvailableActions()`: Returns valid actions for current player
  - `executeAction()`: Processes player actions
  - `isBettingRoundComplete()`: Checks if betting round is done

### 4. usePokerEngine Hook (`/src/hooks/usePokerEngine.ts`)

- **Purpose**: Game state management and action history
- **Key Functions**:
  - `addAction()`: Records player actions
  - `getGameState()`: Returns current game state
  - `resetToStreet()`: Resets state to specific street

## State Management

### Form Data Structure

```typescript
interface ShareHandFormData {
  // Game Setup
  gameType: string; // 'nlh', 'plo', etc.
  gameFormat: string; // 'cash', 'tournament'
  stackSize: string; // Default stack size
  smallBlind: string; // Small blind amount
  bigBlind: string; // Big blind amount
  ante: boolean; // Ante enabled

  // Player Setup
  players: Player[]; // Array of all players
  heroPosition: string; // Hero's position
  villainPosition: string; // Main villain's position

  // Cards
  holeCards: string[]; // Hero's hole cards
  flopCards: string[]; // Flop cards (3)
  turnCard: string[]; // Turn card (1)
  riverCard: string[]; // River card (1)

  // Actions by Street
  preflopActions: ActionStep[];
  flopActions: ActionStep[];
  turnActions: ActionStep[];
  riverActions: ActionStep[];

  // Descriptions
  preflopDescription: string;
  flopDescription: string;
  turnDescription: string;
  riverDescription: string;

  // Meta
  title: string;
  description: string;
}
```

### Player Structure

```typescript
interface Player {
  id: string; // Unique identifier
  name: string; // Display name
  position: string; // Position (utg, mp, co, btn, sb, bb)
  stackSize: number[]; // [current, starting] stack sizes
  isHero?: boolean; // Is this the hero player
}
```

### Action Step Structure

```typescript
interface ActionStep {
  playerId: string; // Player taking action
  playerName: string; // Display name
  isHero: boolean; // Is hero
  action?: string; // Action type (fold, check, call, bet, raise, all-in)
  betAmount?: string; // Amount for betting actions
  completed: boolean; // Action completed
  position?: string; // Player position
}
```

## Action Flow Logic

### Key Concepts

#### 1. Action Order

- **Preflop**: UTG → UTG+1 → MP → LJ → HJ → CO → BTN → SB → BB
- **Postflop**: SB → BB → UTG → UTG+1 → MP → LJ → HJ → CO → BTN

#### 2. Betting Round Completion

A betting round is complete when:

1. Only one active player remains (others folded)
2. All active players have matched the current bet
3. All active players are all-in
4. Only one player with chips remains (others all-in)

#### 3. Street Transitions

When transitioning between streets:

- Pot carries over
- Current bet resets to 0
- Player bets reset to 0
- Folded players remain folded
- All-in players remain all-in
- Action starts with first active player in new order

### Action State Management

```typescript
interface ActionState {
  currentPlayerIndex: number; // Index in ordered players array
  pot: number; // Current pot size
  currentBet: number; // Current bet to match
  lastRaiserIndex: number | null; // Last player who raised
  actions: Action[]; // Action history
  playerBets: Map<string, number>; // Current round bets by player
  street: string; // Current street
  foldedPlayers: Set<string>; // Players who folded
  allInPlayers: Set<string>; // Players who are all-in
}
```

## Data Structures

### Position Constants (`/src/constants/PositionTypes.ts`)

```typescript
enum Position {
  UTG = 'utg',
  UTG_PLUS_ONE = 'utg1',
  MIDDLE_POSITION = 'mp',
  LOJACK = 'lj',
  HIJACK = 'hj',
  CUTOFF = 'co',
  BUTTON = 'btn',
  SMALL_BLIND = 'sb',
  BIG_BLIND = 'bb',
}
```

### Action Types (`/src/constants/ActionTypes.ts`)

```typescript
enum ActionType {
  FOLD = 'fold',
  CHECK = 'check',
  CALL = 'call',
  BET = 'bet',
  RAISE = 'raise',
  ALL_IN = 'all-in',
}
```

### Street Types (`/src/constants/StreetTypes.ts`)

```typescript
enum StreetType {
  PREFLOP = 'preflopActions',
  FLOP = 'flopActions',
  TURN = 'turnActions',
  RIVER = 'riverActions',
}
```

## UI Flow

### Step Navigation

1. **Game Setup** → Configure game type, blinds, stakes
2. **Positions** → Add players and assign positions
3. **Preflop** → Select hole cards, enter preflop actions
4. **Flop** → Select flop cards, enter flop actions
5. **Turn** → Select turn card, enter turn actions
6. **River** → Select river card, enter river actions
7. **Review** → Review and submit hand

### Action Entry Flow

1. System determines current player based on action order
2. Available actions are calculated based on game state
3. Player selects action (and amount if applicable)
4. Action is validated and executed
5. Stack sizes and pot are updated
6. Next player is determined
7. Process repeats until round complete

## Betting Algorithm

### Key Functions in useActionFlow

#### getCurrentPlayer()

```typescript
// Simplified algorithm
1. Check if all players are all-in → return null
2. Check if betting round complete → return null
3. Starting from currentPlayerIndex:
   - Find next non-folded, non-all-in player
   - Return that player
4. If no active player found → return null
```

#### getAvailableActions()

```typescript
// Algorithm for determining valid actions
1. If not player's turn → return []
2. Calculate amount to call (currentBet - playerBet)
3. Check remaining stack
4. If currentBet === 0:
   - Add CHECK
   - Add BET (if has chips and others can act)
5. If currentBet > 0:
   - Add FOLD
   - If can cover call → Add CALL
   - If has extra chips → Add RAISE
6. If has any chips → Add ALL_IN
```

#### executeAction()

```typescript
// Action execution flow
1. Validate it's player's turn
2. Based on action type:
   - FOLD: Mark player as folded
   - CHECK: Validate no bet to call
   - CALL: Add call amount to pot, update stack
   - BET: Set new current bet, update pot/stack
   - RAISE: Update current bet to new amount, update pot/stack
   - ALL_IN: Add entire stack to pot, mark as all-in
3. Record action in history
4. Update game state
5. Advance to next player
```

### All-In Scenarios

#### Partial All-In (Call for Less)

When a player goes all-in for less than the current bet:

1. Player is marked as all-in
2. Their entire stack goes to pot
3. They cannot act further
4. Other players continue normal betting
5. No side pot calculation (per requirements)

#### All-In Raise

When a player's all-in exceeds current bet:

1. Current bet is updated to all-in amount
2. All players who already acted must respond
3. lastRaiserIndex is updated
4. Normal raise rules apply

## Common Issues & Solutions

### Issue 1: Stack Size Showing Undefined

**Cause**: Player data structure uses array format `[current, starting]`
**Solution**: Always access via `player.stackSize[0]` with fallback

### Issue 2: Actions Not Switching to Next Player

**Cause**: Folded/all-in players not properly tracked
**Solution**: Maintain separate Sets for folded and all-in players

### Issue 3: BB Not Selected After Street Transition

**Cause**: Wrong player order calculation for new street
**Solution**: Use position-based ordering, find first active player

### Issue 4: Stack Not Updating After Actions

**Cause**: Betting amounts calculated incorrectly
**Solution**: Differentiate between additional amount and total bet

### Issue 5: Betting Round Not Completing with All-Ins

**Cause**: Complex all-in scenarios not handled
**Solution**: Special logic for partial all-ins vs raising all-ins

## Debugging Guide

### Key Areas to Check

1. **Action State**: Log `actionState` in useActionFlow
2. **Player Order**: Verify `orderedPlayers` array
3. **Betting Logic**: Check `isBettingRoundComplete()` conditions
4. **Stack Updates**: Monitor `setFormData` calls
5. **Street Transitions**: Watch for `street` prop changes

### Console Logging Points

```typescript
// In useActionFlow.ts
console.log('Current Player:', currentPlayer);
console.log('Action State:', actionState);
console.log('Is Round Complete:', isBettingRoundComplete());
console.log('Available Actions:', getAvailableActions(playerId));
```

### Common Validation Errors

1. "Cannot check when there's a bet to call"
2. "Cannot call when there's no bet"
3. "Invalid bet amount"
4. "Not this player's turn"

## Performance Considerations

1. **Memoization**: Use React.memo for poker table components
2. **State Updates**: Batch related updates together
3. **Re-renders**: Minimize by using specific context slices
4. **Calculations**: Cache expensive calculations like player ordering

## Future Enhancements

1. **Side Pot Calculation**: Currently skipped per requirements
2. **Multi-way Pots**: Enhanced UI for 3+ player scenarios
3. **Hand History Import**: Parse text-based hand histories
4. **Animation**: Smooth transitions for chip movements
5. **Validation**: More comprehensive action validation

## Testing Scenarios

### Critical Test Cases

1. **Heads-up All-In**: SB goes all-in, BB calls
2. **Multi-way Pot**: 3+ players, one goes all-in for less
3. **Street Transition**: Verify correct player selection
4. **Complex Betting**: Multiple raises and re-raises
5. **Edge Cases**:
   - All players all-in
   - Only one player with chips
   - Minimum raise amounts

This documentation represents the current state of the hand sharing system. The betting logic, especially around all-in scenarios and street transitions, is the most complex part of the system and where most bugs occur.
