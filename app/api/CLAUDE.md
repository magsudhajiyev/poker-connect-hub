# API Directory

## Overview

Next.js 13+ API routes implementing the backend functionality for Poker Connect Hub. All routes use the App Router pattern with route handlers.

## Key API Endpoints

### Authentication (`/auth`)

- **NextAuth.js Integration**
- OAuth providers: Google, Facebook
- JWT session management
- Protected route middleware

### Hand Management (`/hands`)

#### Core Endpoints

- **`GET /hands`** - List public hands with pagination
- **`POST /hands/save-engine`** - Save hand from poker engine state
- **`GET /hands/[id]`** - Get hand details
- **`DELETE /hands/[id]`** - Delete hand (owner only)

#### Event Sourcing (`/hands/[id]`)

- **`/command`** - Process poker actions
  - Validates actions against game rules
  - Persists events to MongoDB
  - Returns updated state
- **`/events`** - Get hand event history
  - Supports replay functionality
  - Ordered by sequence number
- **`/valid-actions`** - Get current legal actions
  - Based on current game state
  - Prevents invalid moves

- **`/replay`** - Replay to specific event
  - Time-travel debugging
  - State reconstruction

### User Management (`/users`)

- **`GET /users/[id]`** - Get user profile
- **`PATCH /users/[id]`** - Update profile
- **`GET /users/[id]/stats`** - Get poker statistics

### Social Features (`/comments`)

- **`GET /comments?handId=X`** - Get hand comments
- **`POST /comments`** - Add comment
- **`DELETE /comments/[id]`** - Delete comment

## Important Patterns

### Request Validation

```typescript
// Schema validation with Zod
const schema = z.object({
  playerId: z.string(),
  action: z.enum(['fold', 'check', 'call', 'bet', 'raise']),
  amount: z.number().optional(),
});
```

### Error Handling

```typescript
// Consistent error responses
return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
```

### Database Access

- MongoDB with Mongoose
- Connection pooling
- Transaction support for event sourcing

### Authentication Guards

```typescript
// Protected routes
const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Event Sourcing Architecture

### Event Storage

- Events stored in `HandEvent` collection
- Immutable event log
- Sequence numbers for ordering

### State Reconstruction

- Rebuild state from events
- Deterministic replay
- Audit trail for all actions

### Concurrency Control

- Optimistic locking
- Event sequence validation
- Atomic operations
