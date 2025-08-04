# Test Action Flow

## Steps to Test

1. Start the dev server: `npm run dev`
2. Go to Share Hand flow
3. Set up a UTG vs SB game:
   - Add UTG player with $100 stack
   - Add SB player with $100 stack
   - Set blinds to $1/$2
4. Start the hand

## Expected Behavior

### Preflop
1. UTG should be highlighted (green pulse) as first to act
2. Click UTG - should show action dialog
3. Select "Call" 
4. After UTG calls, SB should be highlighted (green pulse)
5. Click SB - should show action dialog
6. Select "Call"
7. Should advance to flop

### Flop
1. SB should be highlighted (green pulse) as first to act postflop
2. Click SB - should show action dialog
3. Select "Check"
4. After SB checks, UTG should be highlighted (green pulse)
5. Click UTG - should show action dialog
6. Select "Check"
7. Should advance to turn

### Turn
1. SB acts first again
2. Action should properly advance to UTG after SB acts

### River
1. SB acts first again
2. Action should properly advance to UTG after SB acts

## What Was Fixed

1. **PokerTable Component**: Changed from using a memoized callback to directly subscribing to the active player ID from the store. This ensures the component re-renders when the active player changes.

2. **Store Subscription**: The component now directly subscribes to `activePlayerId` which is computed from either:
   - The engine state's `betting.actionOn` (primary source)
   - The active action slot (fallback)

3. **Re-render Trigger**: When an action is processed and the engine state updates with a new `actionOn` player, the PokerTable component will re-render and update which player seat shows as active.

## Debug Info

If the issue persists:
1. Open browser console
2. Look for any error messages
3. Check if the active player ID is changing after each action
4. Verify that the player seats are re-rendering