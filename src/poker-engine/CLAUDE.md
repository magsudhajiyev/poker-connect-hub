# Poker Engine Directory

## Overview

The core poker game engine implementing Texas Hold'em rules with event sourcing architecture. This is the heart of the application, ensuring all poker rules are correctly enforced.

## Architecture

### Core Engine (`/core`)

#### engine.ts

- **PokerHandEngine** class - Main engine orchestrating game flow
- Event processing and validation
- State transitions
- Automatic street advancement
- Winner determination

#### state.ts

- **HandState** interface - Complete game state representation
- Player states, betting info, community cards
- Immutable state updates
- State validation

#### rules.ts

- **PokerRules** class - Rule enforcement
- Legal action calculation
- Bet sizing validation
- Position-based rules
- Side pot calculations

#### events.ts

- Event type definitions
- Event data structures
- Event validation schemas

### Adapters (`/adapters`)

#### EventSourcingAdapter.ts

- **Bridge between engine and persistence**
- Event storage to MongoDB
- State reconstruction from events
- Concurrency control
- Transaction management

Key methods:

- `processCommand()` - Validate and execute actions
- `rebuildState()` - Reconstruct from events
- `getValidActions()` - Current legal moves
- `persistEvent()` - Save to database

### Services (`/services`)

#### builder.ts

- **HandBuilderService** - Legacy hand construction
- Step-by-step hand building
- Validation at each step
- Used for non-event-sourced hands

### Repository (`/repository`)

#### schemas.ts

- Data validation schemas
- Ensures data integrity
- Type-safe persistence

## Key Features

### Event Sourcing

```typescript
// All actions create events
const event: ActionTakenEvent = {
  type: 'ACTION_TAKEN',
  data: {
    playerId,
    action,
    amount,
    street,
    potBefore,
    potAfter,
  },
};
```

### Rule Validation

```typescript
// Comprehensive rule checking
- Cannot check when facing a bet
- Minimum raise requirements
- All-in handling
- Position-based action order
```

### State Management

```typescript
// Immutable state updates
const newState = {
  ...currentState,
  betting: {
    ...currentState.betting,
    pot: currentState.betting.pot + amount,
  },
};
```

### Side Pots

```typescript
// Automatic side pot creation
- Multiple all-ins handled correctly
- Proper pot distribution
- Winner determination per pot
```

## Testing

### Test Structure (`/__tests__`)

- **Unit tests** - Individual rule validation
- **Integration tests** - Full hand scenarios
- **Edge case tests** - Complex situations
- **Regression tests** - Bug prevention

### Scenario Tests

- `basic-headsup.test.ts` - Two player games
- `three-way-pots.test.ts` - Multi-way action
- `side-pots.test.ts` - All-in scenarios
- `bug-prevention.test.ts` - Known issue prevention

## Important Patterns

### Command Pattern

Actions are commands processed by the engine:

```typescript
adapter.processCommand(playerId, action, amount);
```

### Observer Pattern

Engine emits events for state changes:

```typescript
engine.onEvent(async (event) => {
  await persistEvent(event);
});
```

### State Machine

Clear state transitions:

- PREFLOP → FLOP → TURN → RIVER → COMPLETE

### Validation First

All actions validated before execution:

1. Is it player's turn?
2. Is action legal?
3. Is amount valid?
4. Apply action
5. Check for automatic transitions

## Critical Rules Implemented

### Betting Rules

- No-limit betting structure
- Minimum raise = previous raise size
- All-in for less doesn't reopen betting
- Proper blind posting

### Position Rules

- UTG acts first preflop after blinds
- SB acts first on all post-flop streets
- Heads-up: BTN = SB, acts first preflop

### Showdown Rules

- Best hand wins
- Side pots awarded separately
- Ties split pots equally
- Automatic winner if all fold

## Integration Points

### With Store

- Store subscribes to engine events
- Synchronizes UI state
- Manages action flow

### With API

- API routes use adapter
- Validates actions
- Persists events
- Returns state updates

### With UI

- UI queries valid actions
- Displays current state
- Processes user input
- Shows results
