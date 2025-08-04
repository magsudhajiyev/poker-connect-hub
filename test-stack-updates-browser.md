# Stack Update Fix - Browser Testing Guide

## What Was Fixed

1. **Added comprehensive debugging** to track player data flow:
   - ShareHandProvider logs when players update
   - PreflopStep logs what players it receives
   - PokerTable logs when it receives new player props
   - PlayerSeatDisplayOptimized logs when it renders

2. **Enhanced PokerTable memoization** with custom comparison:
   - Detects when any player's stack changes
   - Detects when any player's bet amount changes
   - Forces re-render when these values change

3. **Store already had proper updates**:
   - Creates new array for stackSize: `[enginePlayer.stackSize]`
   - Deep clones players array
   - Updates betAmount from engine state

## How to Test in Browser

1. Open http://localhost:3000 in your browser
2. Open the browser console (F12)
3. Navigate to the share hand feature
4. Set up a hand with 2+ players (e.g., UTG and SB)
5. Set blinds (e.g., 5/10)
6. Start the hand and watch the console logs

## Expected Behavior

When UTG raises to 20:
- Console should show: `[PokerHandStore] Player utg stack update: { oldStack: 100, newStack: 80, betAmount: 20 }`
- Console should show: `[ShareHandProvider] Players updated:` with UTG stack: 80
- Console should show: `[PokerTable] Player utg stack changed from 100 to 80, re-rendering`
- Console should show: `[PlayerSeat] Rendering utg: { stack: 80, betAmount: 20 }`
- **UI should show UTG's stack as $80 (not $100)**

When SB calls:
- Similar logs for SB with stack decreasing by the call amount
- **UI should show SB's updated stack**

## What to Look For

1. **Stack Display**: Player stacks should decrease when they bet/raise/call
2. **Bet Display**: Current bet amounts should show next to players
3. **All-in**: When a player goes all-in, stack should show "All-in" or $0
4. **Console Logs**: Should show the data flow through all components

## If It's Not Working

Check the console for:
- Any errors
- Whether ShareHandProvider shows updated stacks
- Whether PokerTable detects the stack changes
- Whether PlayerSeatDisplayOptimized renders with new values

The fix ensures that:
- Engine updates stacks correctly ✓
- Store updates players array with new stacks ✓
- ShareHandProvider subscribes to updates ✓
- PokerTable detects stack changes and re-renders ✓
- PlayerSeatDisplayOptimized shows updated stacks ✓