# Technical Debt - Any Types to Fix

This document tracks TypeScript 'any' types that need to be replaced with proper types in the future. These were left as-is during deployment preparation to avoid breaking functionality.

## Files with 'any' types that need fixing:

### JWT Authentication

- `/src/lib/jwt-auth.ts:22` - JWT decode result needs proper type definition
- `/app/api/auth/google/sync/route.ts:91` - Error response type needs definition

### AuthContext

- `/src/contexts/AuthContext.tsx:86` - Error type in catch block
- `/src/contexts/AuthContext.tsx:130` - Session type cast
- `/src/contexts/AuthContext.tsx:132` - Session user type cast

### API Error Handler

- `/src/utils/apiErrorHandler.ts:173` - Error status property needs type

### Poker Game Logic

- `/src/utils/PokerActionsAlgorithm.ts` - Multiple any types for action objects and player data structures
  - Line 4, 45, 49, 50, 154, 271, 290, 306, 333, 375, 436, 448, 454, 486, 509, 520
  - These represent complex poker game state and action structures that need proper interfaces

### Share Hand Logic

- `/src/hooks/useShareHandLogic.ts:40-46` - Action types need proper interfaces
- `/src/hooks/useShareHandLogic.ts:203` - allActions parameter type

### Services

- `/src/services/api.ts:34` - Request config transformRequest
- `/src/services/api.ts:178,185` - Error response handling
- `/src/services/poker.ts:45,87,131` - API response types
- `/src/services/sharedHandsApi.ts` - Multiple response and data types

### Utilities

- `/src/utils/env.ts:12,25,38` - Process.env access type safety

### Test Utilities

- `/src/test/setup.tsx:26` - vi.fn() mock type
- `/src/test/utils.tsx:20,43` - Test wrapper props

### Types

- `/src/types/unified.ts:86,109,115-117` - Complex unified type definitions

### Follow System API Routes (Added in Follow Feature)

- `/app/api/users/[id]/followers/route.ts:40` - MongoDB populate result type
- `/app/api/users/[id]/following/route.ts:40` - MongoDB populate result type
- `/app/api/users/[id]/route.ts:37,42,58,66-72,80` - MongoDB aggregation and user data types

## Priority for fixing:

1. **High Priority**: API response types and error handling
2. **Medium Priority**: Game logic and action types
3. **Low Priority**: Test utilities and environment variables

## Notes:

- Many of these 'any' types are in complex game logic where proper typing requires creating comprehensive interfaces
- Some are in third-party integration points where the exact shape isn't always known
- Test utilities can remain with 'any' as they don't affect production code
