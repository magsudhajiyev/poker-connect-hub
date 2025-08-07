# Stores Directory

## Overview

Zustand-based state management for the Poker Connect Hub application. Provides centralized state management with TypeScript support and persistence.

## Main Store

### poker-hand-store.ts

**The central state store** managing the entire poker hand creation and playback flow.

#### Key State Properties

```typescript
interface PokerHandState {
  // Players and positions
  players: Player[];

  // Current game state
  engineState: EngineState | null;
  currentStreet: Street;
  isBettingRoundComplete: boolean;

  // Action management
  streets: Record<Street, StreetState>;

  // Form data
  formData: {
    gameFormat: string;
    blinds: { small: number; big: number };
    ante?: number;
    currency: string;
    // ... more fields
  };

  // Event sourcing
  eventAdapter: EventSourcingAdapter | null;
  handId: string | null;
}
```

#### Core Actions

##### Game Initialization

```typescript
initializeGame(players, gameConfig);
initializeEngine();
createHandWithEventSourcing(data);
```

##### Action Processing

```typescript
processAction(slotId, action, amount?)
getValidActionsForCurrentPlayer()
getCurrentActionSlot()
```

##### State Queries

```typescript
isPlayerToAct(playerId);
getCurrentPlayer();
getLegalActions();
```

##### Street Management

```typescript
advanceToNextStreet();
generateActionSlots(street);
completeStreet(street);
```

## State Architecture

### Action Slots

Manages the action order for each street:

```typescript
interface ActionSlot {
  id: string;
  playerId: string;
  position: string;
  isActive: boolean;
  hasActed: boolean;
  actions: ActionRecord[];
}
```

### Event Sourcing Integration

- Adapter pattern for persistence
- State reconstruction from events
- Optimistic updates with rollback

### Engine Integration

Two modes of operation:

1. **Legacy mode** - Direct engine manipulation
2. **Event sourcing mode** - Through event adapter

## Key Features

### Subscription Pattern

```typescript
// Subscribe to specific state slices
const engineState = usePokerHandStore((state) => state.engineState);
const isPlayerToAct = usePokerHandStore((state) => state.isPlayerToAct);
```

### Computed Values

```typescript
// Derived state calculations
getCurrentPot() {
  return this.engineState?.currentState?.betting?.pot || 0;
}
```

### Middleware Integration

- Persistence to localStorage
- DevTools integration
- Action logging

## Usage Patterns

### In Components

```typescript
function PokerTable() {
  const { players, processAction } = usePokerHandStore();

  const handleAction = async (action: ActionType) => {
    const slot = getCurrentActionSlot();
    await processAction(slot.id, action);
  };
}
```

### In Hooks

```typescript
function usePokerActions() {
  const store = usePokerHandStore();

  return {
    fold: () => store.processAction(slot.id, ActionType.FOLD),
    check: () => store.processAction(slot.id, ActionType.CHECK),
    // ... more actions
  };
}
```

### Selectors

```typescript
// Efficient re-renders with selectors
const selectCurrentPlayer = (state) => state.getCurrentPlayer();
const currentPlayer = usePokerHandStore(selectCurrentPlayer);
```

## Performance Optimizations

### Shallow Comparison

```typescript
// Only re-render when specific values change
const { pot, street } = usePokerHandStore(
  (state) => ({
    pot: state.engineState?.currentState?.betting?.pot,
    street: state.currentStreet,
  }),
  shallow,
);
```

### Action Batching

Multiple state updates in single render:

```typescript
set((state) => ({
  currentStreet: nextStreet,
  isBettingRoundComplete: false,
  streets: updateStreets(state.streets),
}));
```

### Memoized Selectors

```typescript
const memoizedSelector = useMemo(() => (state) => expensiveComputation(state), [dependency]);
```

## Testing

### Store Testing

- Unit tests for all actions
- Integration tests with engine
- State transition tests
- Async action tests

### Mock Store

```typescript
const createMockStore = (initialState) => {
  return create(() => ({
    ...defaultState,
    ...initialState,
  }));
};
```

## Best Practices

1. **Keep actions pure** - No side effects in reducers
2. **Use TypeScript** - Full type safety
3. **Optimize selectors** - Prevent unnecessary renders
4. **Test thoroughly** - Cover all state transitions
5. **Document complex logic** - Clear comments for algorithms
