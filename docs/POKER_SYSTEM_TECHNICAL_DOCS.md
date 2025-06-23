# Poker Hand Sharing System - Technical Documentation

*Last Updated: 2025-01-22*  
*Version: 1.0.0*

## Table of Contents
1. [System Overview](#system-overview)
2. [Authentication System](#authentication-system)
3. [Game Logic & Calculations](#game-logic--calculations)
4. [State Management](#state-management)
5. [Key Components Documentation](#key-components-documentation)
6. [Bug Fixes History](#bug-fixes-history)
7. [Technical Decisions](#technical-decisions)
8. [Testing Scenarios](#testing-scenarios)

---

## System Overview

### Architecture Overview
The poker hand sharing system is a React/TypeScript frontend application with a NestJS backend that allows users to recreate poker hands step-by-step and share them with the community.

**Core Workflow:**
1. **Game Setup** - Basic game information (cash/MTT, blinds)
2. **Positions** - Player positions and stack sizes 
3. **Preflop** - Preflop betting actions
4. **Flop** - Flop cards and actions
5. **Turn** - Turn card and actions  
6. **River** - River card and final actions

### Core Components Hierarchy
```
ShareHandProvider (Context & State)
├── ShareHandForm (Step Container)
│   ├── PositionsStep
│   │   └── PokerTable
│   │       └── PlayerSeatDisplay (Stack Rendering)
│   ├── PreflopStep
│   │   ├── PokerTable  
│   │   ├── PotDisplay (Pot Rendering)
│   │   └── PlayerActionDialog
│   └── Navigation (Step Controls)
└── useActionFlow (Game Logic Hook)
```

### Data Flow
1. **User Input** → `ShareHandForm` → `ShareHandProvider` → `formData` state
2. **Game Logic** → `useActionFlow` → Updates `formData` via `setFormData`
3. **Display** → Components read from `formData` via context → UI updates

---

## Authentication System

### Google OAuth Integration

**Backend Authentication Architecture:**
```
NestJS Backend:
├── auth/
│   ├── auth.module.ts       # Main auth module
│   ├── auth.service.ts      # JWT and user logic
│   ├── auth.controller.ts   # OAuth endpoints
│   ├── strategies/
│   │   ├── google.strategy.ts  # Google OAuth strategy
│   │   └── jwt.strategy.ts     # JWT validation
│   └── guards/
│       ├── google-auth.guard.ts
│       └── jwt-auth.guard.ts
├── users/
│   ├── users.service.ts     # User CRUD operations
│   └── entities/user.entity.ts  # User database model
└── database/
    └── database.module.ts   # TypeORM configuration
```

**Frontend Authentication Architecture:**
```
React Frontend:
├── contexts/
│   └── AuthContext.tsx     # Authentication state management
├── pages/
│   ├── Auth.tsx            # Google login page
│   └── Dashboard.tsx       # Authenticated user dashboard
└── main.tsx               # GoogleOAuthProvider setup
```

### Authentication Flow

1. **User clicks "Continue with Google"** → Redirects to `/auth/google`
2. **Google OAuth consent** → User grants permissions
3. **Backend receives callback** → `/auth/google/callback`
4. **User creation/validation** → Find or create user in database
5. **JWT token generation** → Access token (15min) + Refresh token (7d)
6. **Set HTTP-only cookies** → Secure token storage
7. **Redirect to frontend** → `/dashboard` with authentication

### Security Implementation

**Token Management:**
- **Access Token**: Short-lived (15 minutes), HTTP-only cookie
- **Refresh Token**: Long-lived (7 days), HTTP-only cookie, hashed in database
- **Automatic refresh**: Axios interceptor handles token refresh

**Security Features:**
- HTTP-only cookies prevent XSS attacks
- Secure cookies in production (HTTPS only)
- SameSite cookies prevent CSRF
- Helmet.js for security headers
- CORS configured for specific origins
- Password hashing for refresh tokens

### Database Schema

**Users Table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  picture VARCHAR(500),
  refresh_token TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

- **`GET /auth/google`** - Initiate Google OAuth flow
- **`GET /auth/google/callback`** - Handle OAuth callback
- **`GET /auth/me`** - Get current user profile
- **`POST /auth/refresh`** - Refresh access token
- **`POST /auth/logout`** - Logout and clear tokens
- **`GET /auth/status`** - Check authentication status

---

## Game Logic & Calculations

### Pot Calculation Logic

**Core Formula:**
```typescript
newPot = previousPot + additionalAmount
```

**Key Rules:**
- Only additional chips go to pot, not total bet amounts
- For RAISE: `additionalAmount = totalBetAmount - playerCurrentBet`
- For BET: `additionalAmount = betAmount`
- For CALL: `additionalAmount = amountToCall`

**Example Scenario:**
```
Initial: Pot = 15 (SB 5 + BB 10)
UTG bets 20 → Pot = 15 + 20 = 35
BB raises to 60 → Additional = 60 - 10 = 50 → Pot = 35 + 50 = 85
UTG calls → Additional = 60 - 20 = 40 → Pot = 85 + 40 = 125
```

### Stack Size Management

**Blind Deduction (Critical):**
- **When**: Only when navigating from positions step (1) to preflop step (2)
- **Where**: `useActionFlow` hook detects step transition
- **Logic**: 
  ```typescript
  SB stack: originalStack - smallBlind
  BB stack: originalStack - bigBlind
  ```

**Action-Based Deductions:**
- **BET/RAISE**: Deduct additional amount from current stack
- **CALL**: Deduct call amount from current stack  
- **ALL_IN**: Set stack to 0

### Betting Actions Logic

#### RAISE Action
**Critical Implementation Detail:**
```typescript
// Input amount = total bet amount (e.g., "raise to 60")
const totalBetAmount = amount;
const additionalAmount = totalBetAmount - playerCurrentBet;

// Update calculations
newPot += additionalAmount;  // Only add additional
newCurrentBet = totalBetAmount;  // New current bet level
playerStack -= additionalAmount;  // Deduct additional from stack
```

#### CALL Action  
```typescript
const amountToCall = Math.max(0, currentBet - playerCurrentBet);
newPot += amountToCall;
playerStack -= amountToCall;
```

#### BET Action
```typescript
// Only when currentBet === 0
newPot += amount;
newCurrentBet = amount;
playerStack -= amount;
```

#### ALL_IN Action
```typescript
const allInAmount = playerStack - playerCurrentBet;
newPot += allInAmount;
if (playerCurrentBet + allInAmount > currentBet) {
  newCurrentBet = playerCurrentBet + allInAmount;
}
playerStack = 0;
```

### Blind Posting Mechanics

**Critical Timing:** Blind deduction happens exactly once when user navigates from positions to preflop step.

**Detection Logic:**
```typescript
const isNavigatingToPreflop = 
  street === StreetType.PREFLOP && 
  !gameStartedRef.current && 
  orderedPlayers.length > 0 &&
  currentStep === 2 &&  // Currently on preflop step
  previousStepRef.current === 1 &&  // Was on positions step
  isFirstInitialization;
```

**Deduction Process:**
1. Find SB and BB players by position
2. Deduct blinds from their stacks via `setFormData`
3. Mark players as deducted to prevent double deduction
4. Set `gameStartedRef.current = true` to prevent re-deduction

---

## State Management

### Step Navigation System

**Steps Definition:**
```typescript
const steps = [
  { id: 'game-setup', title: 'Setup' },      // Step 0
  { id: 'positions', title: 'Positions' },   // Step 1  
  { id: 'preflop', title: 'Preflop' },      // Step 2
  { id: 'flop', title: 'Flop' },            // Step 3
  { id: 'turn', title: 'Turn' },            // Step 4
  { id: 'river', title: 'River' },          // Step 5
];
```

**Current Step Tracking:**
- Managed in `useShareHandLogic` hook
- Available throughout app via `ShareHandContext`
- Used for navigation detection in `useActionFlow`

### Player State Structure
```typescript
interface Player {
  id: string;
  position: Position;  // 'utg', 'sb', 'bb', etc.
  stackSize: [number, number];  // [currentStack, originalStack]
  // ... other properties
}
```

### Action State Management
```typescript
interface ActionState {
  currentPlayerIndex: number;
  pot: number;
  currentBet: number;
  lastRaiserIndex: number | null;
  actions: Array<{playerId: string, action: ActionType, amount?: number}>;
  playerBets: Map<string, number>;
  street: string;
  foldedPlayers: Set<string>;
  allInPlayers: Set<string>;
}
```

### Form Data Synchronization

**Key Pattern:**
```typescript
// useActionFlow updates formData
setFormData(prev => ({
  ...prev,
  players: prev.players.map(p => 
    p.id === playerId 
      ? { ...p, stackSize: [newStackSize, p.stackSize[1]] }
      : p
  )
}));

// Components read from formData via context
const { formData } = useShareHandLogic();
const playerStack = formData.players.find(p => p.id === playerId)?.stackSize[0];
```

---

## Key Components Documentation

### useActionFlow Hook

**Purpose:** Core poker game logic and action execution  
**Location:** `/src/hooks/useActionFlow.ts`

**Key Responsibilities:**
- Manages betting rounds and action order
- Calculates pot sizes and stack updates
- Handles blind deduction on navigation
- Validates available actions for players
- Tracks game state (folded players, all-ins, etc.)

**Critical Parameters:**
```typescript
useActionFlow(
  players: Player[],
  smallBlind: number,
  bigBlind: number, 
  street: string,
  setFormData?: (updater: (prev: any) => any) => void,
  currentStep?: number  // CRITICAL: For navigation detection
)
```

**Key Methods:**
- `executeAction(playerId, action, amount)` - Execute player action
- `getAvailableActions(playerId)` - Get valid actions for player
- `isPlayerToAct(playerId)` - Check if player should act
- `getCurrentPlayer()` - Get current player to act

### ShareHandProvider

**Purpose:** Context provider for hand sharing state  
**Location:** `/src/components/share-hand/ShareHandProvider.tsx`

**Key Responsibilities:**
- Provides `formData` and `setFormData` to all child components
- Integrates `useActionFlow` with step management
- Manages current street calculation
- Provides poker action state to components

### useDisplayValues Hook

**Purpose:** Currency formatting and display logic  
**Location:** `/src/hooks/useDisplayValues.ts`

**Key Features:**
- Unified currency system (chips for MTT, $ for cash)
- Large number formatting (10K, 1.2M)
- Separate pot formatting logic
- No more BB display mode (removed for simplification)

**Critical Methods:**
```typescript
formatChipAmount(amount: number): { formatted: string, symbol: string }
formatPotAmount(amount: number): { formatted: string, symbol: string }
formatLargeNumber(amount: number): string
```

### Navigation Detection System

**Critical Implementation:**
- Step-based detection replaces player-count-based detection
- Tracks previous step to detect transitions
- Prevents race conditions and timing issues

---

## Bug Fixes History

### 1. All-In Premature Round Completion (Fixed)

**Issue:** Betting rounds ended immediately after all-in without letting other players respond.

**Root Cause:** `isBettingRoundComplete()` didn't account for players needing to respond to all-ins.

**Fix:** Added logic to check for players who need to respond to all-in:
```typescript
const playersWhoNeedToRespondToAllIn = activePlayers.filter(player => {
  if (actionState.allInPlayers.has(player.id)) return false;
  const playerActionsAfterAllIn = actionState.actions.slice(allInActionIndex + 1)
    .filter(action => action.playerId === player.id);
  return playerActionsAfterAllIn.length === 0;
});
```

### 2. Pot Calculation Double-Counting (Fixed)

**Issue:** RAISE actions were adding full amount to pot instead of additional amount.

**Example:** Pot is 11.5 BB, player raises 20 BB, pot showed 26.5 instead of 31.5.

**Fix:** Modified RAISE logic to only add additional amount:
```typescript
const additionalAmount = totalBetAmount - playerCurrentBet;
newPot += additionalAmount;  // Only add additional, not total
```

### 3. Preflop Pot Initialization (Fixed)

**Issue:** Preflop pot showed incorrect values like "BB 4.0" instead of proper blind sum.

**Root Cause:** Not all players were being added to `playerBets` Map during initialization.

**Fix:** Ensured all players are initialized in `playerBets` during preflop setup.

### 4. BB Display Mode Complexity (Fixed)

**Issue:** MTT BB/chips conversion was causing calculation errors and bugs.

**Decision:** Removed BB display mode entirely, using unified currency:
- Cash games: Display in $ (e.g., $150)
- MTT games: Display in chips (e.g., 1500)

**Benefits:** Eliminated unit conversion bugs and simplified calculations.

### 5. Blind Deduction Double/Triple Execution (Fixed)

**Issue:** BB blind amount being deducted multiple times during player setup (BB showing 980 instead of 990).

**Root Cause:** `useEffect` was triggering on every player addition during positions step.

**Fix:** Moved blind deduction to navigation event detection:
```typescript
const isNavigatingToPreflop = 
  currentStep === 2 && 
  previousStepRef.current === 1 &&
  // ... other conditions
```

### 6. RAISE Logic Input Interpretation (Fixed)

**Issue:** User expected "raise 60" to mean "add 60 chips" but code interpreted as "raise to 60 total".

**Resolution:** Clarified and implemented "raise to X total" logic:
- Input "60" means player's total bet becomes 60
- Additional amount = 60 - current bet
- Stack decreases by additional amount only

### 7. Navigation-Based Blind Deduction (Fixed)

**Issue:** Blind deduction never triggered when navigating from positions to preflop.

**Root Cause:** Faulty navigation detection using player count comparison.

**Fix:** Implemented step-based navigation detection:
- Track previous step with `useRef`
- Detect transition from positions (step 1) to preflop (step 2)
- Trigger blind deduction exactly once on this transition

---

## Technical Decisions

### 1. Currency System Simplification

**Decision:** Remove BB display mode entirely and use unified currency system.

**Rationale:**
- Eliminated complex unit conversions between BB and chips
- Reduced calculation errors and edge cases  
- Simplified display logic and user experience
- Cash games show $ amounts, MTT shows chip amounts

### 2. Step-Based Navigation Detection

**Decision:** Use step transitions instead of player count changes for blind deduction.

**Rationale:**
- Player count changes during setup don't indicate navigation
- Step transitions are explicit user actions (clicking "Next")
- More reliable and predictable than count-based detection
- Eliminates race conditions and timing issues

### 3. Ref-Based State Tracking

**Decision:** Use `useRef` for tracking game state and preventing double execution.

**Rationale:**
- Persists across re-renders without causing additional renders
- Ideal for tracking "already executed" flags
- Prevents infinite loops in useEffect dependencies

### 4. Pot vs Stack Update Separation

**Decision:** Separate pot calculations from stack updates in action execution.

**Rationale:**
- Clear separation of concerns
- Easier debugging and testing
- Pot reflects total money in play
- Stacks reflect individual player holdings

---

## Testing Scenarios

### Critical Test Cases

#### 1. Blind Deduction Navigation Test
```
Setup: UTG (1000), SB (1000), BB (1000), blinds 5/10
Steps:
1. Set up players in positions step → All show 1000
2. Navigate to preflop step → SB: 995, BB: 990, Pot: 15
3. Verify no double deduction on re-renders
```

#### 2. RAISE Logic Test  
```
Setup: UTG vs BB, both 100 chips, BB already posted 10
Steps:  
1. UTG raises to 20 → UTG: 80, Pot: 35, Current bet: 20
2. BB raises to 60 → BB: 40 (90-50), Pot: 85, Current bet: 60  
3. UTG calls → UTG: 40 (80-40), Pot: 125
```

#### 3. All-In Response Test
```
Setup: 3 players with varying stacks
Steps:
1. Player A goes all-in  
2. Verify Player B and C can still respond
3. Verify round doesn't end prematurely
```

#### 4. Pot Calculation Accuracy
```
Test various betting scenarios:
- Multiple raises and calls
- All-in situations  
- Side pot calculations
- Verify pot = sum of all bets
```

### Edge Cases to Monitor

1. **Empty player list** during navigation
2. **Missing SB or BB players** in different game formats
3. **React strict mode** double execution
4. **Rapid navigation** between steps
5. **Browser refresh** during hand recreation
6. **Invalid stack sizes** (negative, zero)

### Regression Testing Guidelines

Before any major changes:

1. **Run blind deduction test** - Verify SB/BB stacks update correctly on navigation
2. **Test pot calculations** - Multiple betting scenarios  
3. **Verify RAISE logic** - Input interpretation matches expectations
4. **Check all-in handling** - Round completion logic
5. **Test navigation** - Step transitions work properly
6. **Validate display formatting** - Currency and large numbers

---

## Common Debugging Tips

### 1. Console Log Interpretation
- `🔄 useEffect triggered` - Normal hook execution
- `🎮 Game started!` - Successful navigation detection  
- `🛡️ Starting game` - Blind deduction beginning
- `✅ Blind Deduction EXECUTED` - Successful blind deduction
- `🚫 Blind deduction SKIPPED` - Navigation not detected

### 2. State Inspection
```typescript
// Check current game state
console.log('Current step:', currentStep);
console.log('Previous step:', previousStepRef.current);
console.log('Game started:', gameStartedRef.current);
console.log('Player stacks:', players.map(p => p.stackSize[0]));
```

### 3. Common Issues
- **Stacks not updating:** Check if `setFormData` is being called
- **Double deduction:** Verify `gameStartedRef` is preventing re-execution  
- **Navigation not detected:** Check step transition conditions
- **Pot calculation wrong:** Verify additional vs total amount logic

---

## Notes for Future Development

### 1. Code Maintenance
- Always update this document when fixing bugs
- Add new test scenarios for edge cases discovered
- Document any architectural changes

### 2. Performance Considerations  
- `useActionFlow` is called frequently - keep calculations efficient
- Consider memoizing expensive calculations if performance issues arise
- Monitor re-render frequency in React DevTools

### 3. Extensibility
- Game logic is centralized in `useActionFlow` - good for adding features
- Step system is easily extensible for new betting rounds
- Display logic is separated - easy to add new formatting options

---

*This document should be updated whenever significant changes are made to the poker hand sharing system.*