# Diary Entry: 2025-08-04 - Stack Size UI Update Fix

## The Problem
The poker table UI was not updating player stack sizes after actions were taken. When a player raised (e.g., UTG raises to $20), the pot would update correctly but the player's stack would still show the original amount ($100) instead of the reduced amount ($80).

## Root Cause
The issue was that the UI components were not properly reading the updated state from the poker engine after actions were processed through the event sourcing system. The complex state management with multiple layers of cloning and prop passing was preventing React from detecting changes.

## The Solution
**Simple is better!** Instead of complex state synchronization, I made the `PlayerSeatDisplayOptimized` component directly read from the engine state using the Zustand store:

```typescript
// Direct subscription to engine state
const engineState = usePokerHandStore(state => state.engineState);

// Read stack directly from engine
if (engineState?.currentState?.players) {
  let enginePlayer;
  if (engineState.currentState.players instanceof Map) {
    enginePlayer = engineState.currentState.players.get(player.id);
  } else {
    enginePlayer = engineState.currentState.players[player.id];
  }
  
  if (enginePlayer && typeof enginePlayer.stackSize === 'number') {
    stackValue = enginePlayer.stackSize;
  }
}
```

## Key Changes Made

1. **PlayerSeatDisplayOptimized.tsx**: 
   - Added direct subscription to engine state via `usePokerHandStore`
   - Component now reads stack, status, and bet amounts directly from engine state
   - Handles both Map and plain object formats (for JSON serialization)
   - Removed complex memoization that was preventing re-renders

2. **events/route.ts**:
   - Ensured the API properly converts Map to plain object for JSON serialization
   - Added logging to track state structure

3. **poker-hand-store.ts**:
   - Removed complex player cloning logic 
   - Simplified state updates
   - Added proper state refetch after command processing

## Lessons Learned

1. **Don't overcomplicate state management** - Direct subscriptions to a single source of truth are often better than complex prop drilling and state synchronization.

2. **Trust the framework** - React and Zustand handle subscriptions and re-renders efficiently. We don't need complex memoization when reading from stores.

3. **The engine should be the single source of truth** - All UI components should read game state directly from the engine, not from props that might be stale.

4. **Simple fixes are often the best** - After a week of complex attempts, the solution was simply to read directly from the engine state.

## What Works Now

- Player stacks update immediately after actions
- Pot displays correctly
- Player statuses (folded, all-in) show properly  
- Bet amounts display correctly
- All state stays in sync with the poker engine

The event sourcing architecture is now working properly with the UI!