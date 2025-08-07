# Utils Directory

## Overview

Utility functions and helper modules providing common functionality across the Poker Connect Hub application.

## Core Utilities

### shareHandConstants.ts

**Poker game constants and configurations**

Key exports:

```typescript
// Positions
export const POSITIONS = ['btn', 'sb', 'bb', 'utg', 'utg1', 'mp', 'lj', 'hj', 'co'];

// Actions
export const ACTIONS = {
  FOLD: 'fold',
  CHECK: 'check',
  CALL: 'call',
  BET: 'bet',
  RAISE: 'raise',
  ALL_IN: 'all-in',
};

// Streets
export const STREETS = {
  PREFLOP: 'preflop',
  FLOP: 'flop',
  TURN: 'turn',
  RIVER: 'river',
};

// Position display names
export function getPositionName(position: string): string {
  const names = {
    btn: 'Button',
    sb: 'Small Blind',
    bb: 'Big Blind',
    // ...
  };
  return names[position] || position.toUpperCase();
}
```

### shareHandUtils.ts

**Helper functions for hand sharing**

Common functions:

```typescript
// Format currency
export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Calculate pot
export const calculatePot = (actions: Action[]): number => {
  return actions.reduce((pot, action) => {
    if (action.type === 'bet' || action.type === 'call' || action.type === 'raise') {
      return pot + (action.amount || 0);
    }
    return pot;
  }, 0);
};
```

### positionUtils.ts

**Position and seating logic**

Features:

- Position assignment
- Seat rotation
- Action order calculation
- Heads-up adjustments

```typescript
// Get action order for a street
export const getActionOrder = (players: Player[], street: Street): string[] => {
  if (street === 'preflop') {
    // UTG acts first preflop
    return getPreflopOrder(players);
  } else {
    // SB acts first postflop
    return getPostflopOrder(players);
  }
};
```

### positionValidation.ts

**Position rule validation**

Validates:

- Legal position assignments
- No duplicate positions
- Required positions present
- Heads-up special rules

### pokerHelpers.ts

**General poker calculations**

Utilities for:

- Pot odds calculation
- Stack-to-pot ratio
- Bet sizing helpers
- Winning percentage

```typescript
// Calculate pot odds
export const getPotOdds = (callAmount: number, potSize: number): number => {
  return callAmount / (potSize + callAmount);
};
```

### formatters.ts

**Display formatting utilities**

Formatting for:

- Numbers (with commas)
- Percentages
- Time/date
- Player names
- Action descriptions

```typescript
// Format large numbers
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Format action for display
export const formatAction = (action: Action): string => {
  switch (action.type) {
    case 'bet':
      return `bets ${formatCurrency(action.amount)}`;
    case 'raise':
      return `raises to ${formatCurrency(action.amount)}`;
    // ...
  }
};
```

## Pattern Examples

### Pure Functions

All utilities are pure functions:

```typescript
// No side effects
export const calculateTotal = (items: number[]): number => {
  return items.reduce((sum, item) => sum + item, 0);
};
```

### Type Guards

```typescript
// Type checking utilities
export const isValidPosition = (position: string): position is Position => {
  return POSITIONS.includes(position as Position);
};
```

### Validation Helpers

```typescript
// Input validation
export const validateBetAmount = (
  amount: number,
  minBet: number,
  maxBet: number,
): ValidationResult => {
  if (amount < minBet) {
    return { valid: false, error: 'Bet too small' };
  }
  if (amount > maxBet) {
    return { valid: false, error: 'Bet too large' };
  }
  return { valid: true };
};
```

### Composition

```typescript
// Combine utilities
export const formatPlayerAction = (player: Player, action: Action): string => {
  const name = formatPlayerName(player);
  const actionStr = formatAction(action);
  return `${name} ${actionStr}`;
};
```

## Testing

### Unit Tests

All utilities have comprehensive tests:

```typescript
describe('positionUtils', () => {
  it('should calculate correct action order', () => {
    const players = [{ position: 'btn' }, { position: 'sb' }, { position: 'bb' }];

    const order = getActionOrder(players, 'flop');
    expect(order).toEqual(['sb', 'bb', 'btn']);
  });
});
```

### Edge Cases

Tests cover edge cases:

- Empty inputs
- Invalid data
- Boundary conditions
- Special poker rules

## Performance

### Memoization

Expensive calculations are memoized:

```typescript
const memoizedCalculation = memoize((input) => {
  // Expensive operation
  return result;
});
```

### Efficient Algorithms

- O(n) sorting where possible
- Early returns
- Avoid unnecessary iterations

## Best Practices

1. **Pure functions** - No side effects
2. **Type safety** - Full TypeScript coverage
3. **Single responsibility** - Each function does one thing
4. **Descriptive names** - Self-documenting code
5. **Comprehensive tests** - 100% coverage goal
