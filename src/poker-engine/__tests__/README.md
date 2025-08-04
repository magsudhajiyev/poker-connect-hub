# Poker Engine Tests

This directory contains comprehensive tests for the poker engine with event sourcing.

## Running Tests

### Run all poker engine tests:
```bash
npm run test:poker
```

### Run specific test file:
```bash
npm run test:poker -- src/poker-engine/__tests__/scenarios/basic-headsup.test.ts
```

### Run with coverage:
```bash
npm run test:poker -- --coverage
```

## Test Structure

The tests are organized into scenarios:

- **basic-headsup.test.ts** - Basic heads-up poker scenarios
- **three-way-pots.test.ts** - Three-player pot scenarios
- **side-pots.test.ts** - Side pot creation and management
- **bug-prevention.test.ts** - Tests to prevent common bugs
- **position-rules.test.ts** - Position and action order tests
- **street-transitions.test.ts** - Street progression tests
- **complex-multiway.test.ts** - Complex multi-way scenarios
- **stress-tests.test.ts** - Stress tests with many players

## Test Status

Current test results:
- Total Tests: ~30+
- Passing: ~18 tests
- Failing: ~15 tests

The failing tests indicate areas where the poker engine needs improvements:
- Minimum raise enforcement
- Street transition logic
- Pot calculation in some scenarios
- Position rules in certain cases

## Notes

- Tests use MongoDB Memory Server for isolation
- Each test creates its own hand and events
- Tests verify both the engine state and event sourcing functionality