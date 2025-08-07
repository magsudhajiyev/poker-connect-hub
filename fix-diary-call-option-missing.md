# Fix Diary: Missing CALL Option When Facing Bet

## Date: 2025-08-07

## Problem

When UTG bets on the flop, the next player (CO) doesn't see a CALL option in the action dialog - only Fold, Check, Bet, and All-in. The "Check" option appears incorrectly when facing a bet, and the dialog shows "No valid actions available".

## Root Cause Analysis

### Multiple Issues Identified:

1. **UI/Engine Desynchronization**
   - The poker engine correctly generated CALL as a valid action
   - The API correctly returned the valid actions including CALL
   - The UI failed to properly display these actions

2. **Incorrect Fallback Logic**
   - `usePlayerActionDialog` hook's fallback logic only checked completed actions in the array
   - Didn't check the engine state's `currentBet` to determine if there's a bet to face
   - This caused CHECK to appear instead of CALL when facing a bet

3. **API Response Parsing Issue**
   - The store was looking for `data.validActions` but the API returns `data.data.validActions`
   - This caused the valid actions from the engine to be undefined

4. **Premature Authorization Blocking**
   - The PlayerActionDialog was checking if the player was authorized before fetching actions
   - This prevented the API call from happening even when it should

## Solution Implemented

### 1. Fixed API Response Parsing

**File:** `src/stores/poker-hand-store.ts`

```typescript
// Before
return data.data?.validActions || [];

// After
const actions = data.data?.validActions || data.validActions || [];
return Array.isArray(actions) ? actions : [];
```

### 2. Fixed Fallback Logic

**File:** `app/share-hand/components/poker-table/hooks/usePlayerActionDialog.ts`

```typescript
// Now checks engine state for current bet
const engineCurrentBet = store.engineState?.currentState?.betting?.currentBet || 0;
const hasBet = engineCurrentBet > 0 || hasBetInActions;
```

### 3. Fixed Store Reference Issue

Moved `const store = usePokerHandStore()` to the top of the hook to avoid "Cannot access before initialization" error.

### 4. Improved Authorization Flow

Removed the early return when player isn't authorized, allowing the API to be called and letting the backend determine valid actions.

## Testing

- Created comprehensive unit tests for `usePlayerActionDialog`
- All 129 tests passing
- Verified CALL appears when facing bet
- Verified CHECK appears when no bet to face

## Verification Steps

1. Create UTG vs CO hand
2. Progress to flop
3. UTG bets $25
4. CO opens action dialog
5. ✅ CO sees: FOLD, CALL ($25), RAISE, ALL-IN

## Lessons Learned

1. Always verify the exact structure of API responses
2. Fallback logic should check multiple sources of truth (engine state + action history)
3. Don't block API calls based on potentially stale client-side state
4. Comprehensive testing of UI hooks is essential for catching these issues

## Files Modified

- `src/stores/poker-hand-store.ts`
- `app/share-hand/components/poker-table/hooks/usePlayerActionDialog.ts`
- `app/share-hand/components/poker-table/PlayerActionDialog.tsx`
- `app/share-hand/components/poker-table/hooks/__tests__/usePlayerActionDialog.test.ts` (new)
