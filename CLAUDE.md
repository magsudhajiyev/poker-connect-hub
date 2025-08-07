# Poker Connect Hub - Project Documentation

## Overview

Poker Connect Hub is a comprehensive web application for creating, sharing, and analyzing poker hands. Built with Next.js 13+, it features a sophisticated poker engine with event sourcing architecture, real-time validation, and a multi-step hand creation wizard.

## Architecture Overview

```
poker-connect-hub/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # Backend API endpoints
│   ├── share-hand/        # Hand creation wizard
│   └── feed/              # Community hand feed
├── src/                    # Core application logic
│   ├── poker-engine/      # Poker game engine (heart of the app)
│   ├── stores/            # Zustand state management
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
└── public/                # Static assets
```

## Key Features

### 1. Poker Engine (`src/poker-engine/`)

**The core of the application** - A fully-featured Texas Hold'em engine with:

- Complete rule validation
- Event sourcing architecture
- Side pot calculations
- Position-based logic
- Automatic street transitions

### 2. Hand Sharing Wizard (`app/share-hand/`)

Multi-step form for creating poker hands:

1. Game setup (format, blinds)
2. Player positions and stacks
3. Preflop actions
4. Flop actions
5. Turn actions
6. River actions
7. Review and publish

### 3. Event Sourcing System

- All actions stored as immutable events
- Complete audit trail
- State reconstruction from events
- Time-travel debugging

### 4. Real-time Validation

- Actions validated against poker rules
- Prevents illegal moves
- Immediate user feedback
- Synchronous UI updates

## Technical Stack

### Frontend

- **Next.js 13+** - React framework with App Router
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Component library
- **Zustand** - State management

### Backend

- **Next.js API Routes** - Backend implementation
- **MongoDB** - Database with Mongoose ODM
- **NextAuth.js** - Authentication
- **Event Sourcing** - Audit and replay

### Infrastructure

- **Vercel** - Deployment platform
- **MongoDB Atlas** - Managed database
- **OAuth Providers** - Google, Facebook

## Core Components

### Poker Engine (`src/poker-engine/`)

The engine consists of:

- **Core Engine** - Game flow orchestration
- **State Management** - Immutable game state
- **Rule Validation** - Comprehensive rule checking
- **Event System** - Event-driven architecture

### State Management (`src/stores/poker-hand-store.ts`)

Central store managing:

- Current game state
- Player information
- Action history
- UI synchronization

### API Architecture (`app/api/`)

RESTful endpoints for:

- Hand CRUD operations
- Event sourcing commands
- User management
- Social features

### UI Components (`src/components/`)

Reusable components:

- Card input with validation
- Poker table visualization
- Action dialogs
- Form controls

## Data Flow

### Action Processing

1. **User Input** → UI Component
2. **Validation** → Store/Context
3. **Engine Processing** → Rule validation
4. **Event Creation** → Persist to DB
5. **State Update** → UI re-render

### Event Sourcing Flow

```
User Action → Command → Validation → Event → Storage
                              ↓
                    State Reconstruction ← Events
```

## Key Patterns

### 1. Event Sourcing

```typescript
// All state changes through events
const event: ActionTakenEvent = {
  type: 'ACTION_TAKEN',
  data: { playerId, action, amount },
};
```

### 2. Command Pattern

```typescript
// Actions as commands
adapter.processCommand(playerId, action, amount);
```

### 3. State Machine

```typescript
// Clear state transitions
PREFLOP → FLOP → TURN → RIVER → COMPLETE
```

### 4. Observer Pattern

```typescript
// React to state changes
engine.onEvent(async (event) => {
  await persistEvent(event);
});
```

## Development Guidelines

### Code Organization

- **Feature-based structure** - Related code grouped together
- **Clear separation of concerns** - UI, logic, data layers
- **Type safety** - TypeScript everywhere
- **Testing** - Comprehensive test coverage

### Best Practices

1. **Immutable State** - Never mutate state directly
2. **Pure Functions** - Predictable, testable code
3. **Error Boundaries** - Graceful error handling
4. **Performance** - Memoization, lazy loading
5. **Accessibility** - ARIA labels, keyboard navigation

### Testing Strategy

- **Unit Tests** - Individual functions/components
- **Integration Tests** - Feature workflows
- **E2E Tests** - Critical user paths
- **Scenario Tests** - Complex poker situations

## API Endpoints

### Authentication

- `POST /api/auth/signin` - Sign in
- `GET /api/auth/session` - Get session
- `POST /api/auth/signout` - Sign out

### Hands

- `GET /api/hands` - List hands
- `POST /api/hands/save-engine` - Create hand
- `GET /api/hands/[id]` - Get hand
- `POST /api/hands/[id]/command` - Process action
- `GET /api/hands/[id]/events` - Get events
- `GET /api/hands/[id]/valid-actions` - Get legal moves

### Social

- `GET /api/comments` - Get comments
- `POST /api/comments` - Add comment
- `POST /api/hands/[id]/like` - Like hand

## Development Commands

### Next.js Commands

- `npm run dev` - Start Next.js development server (includes API routes)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run all tests
- `npm test -- --config=jest.config.poker-engine.js` - Run poker engine tests only

### Legacy Commands (DO NOT USE)

- The following commands are for the NestJS backend which we no longer use:
  - `npm run backend:dev`
  - `npm run backend:build`
  - `npm run backend:start`
  - `npm run dev:all`

## Deployment

### Environment Variables

```env
DATABASE_URL=mongodb://...
NEXTAUTH_URL=https://...
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Build Process

```bash
npm run build    # Build production
npm run start    # Start server
npm run test     # Run tests
```

### Deployment Steps

1. Push to main branch
2. Vercel auto-deploys
3. Database migrations run
4. Cache invalidation

## Important Notes

### Architectural Decisions

1. **Single Repository** - Frontend and backend in one Next.js app
2. **No CORS Issues** - API and frontend on same origin
3. **Event Sourcing** - Complete audit trail of all actions
4. **TypeScript Strict Mode** - Maximum type safety

### Performance Optimizations

1. **Memoized Components** - Prevent unnecessary re-renders
2. **Lazy Loading** - Code splitting for large components
3. **Optimistic Updates** - Immediate UI feedback
4. **Database Indexing** - Fast queries on events

### Security Considerations

1. **Authentication** - OAuth with NextAuth.js
2. **Authorization** - Owner-only operations
3. **Input Validation** - Zod schemas
4. **Rate Limiting** - API protection

## Troubleshooting

### Common Issues

1. **Stack not updating** - Check engine state subscription in PlayerSeatDisplayOptimized
2. **Invalid actions** - Verify game state consistency
3. **Event replay issues** - Check event ordering
4. **Performance** - Review component memoization

### Debug Tools

- React DevTools
- Zustand DevTools
- Network inspector
- Console logging with detailed state info

## Directory-Specific Documentation

For detailed documentation about specific directories, see the CLAUDE.md files in each folder:

- `/app/CLAUDE.md` - App Router and pages
- `/app/api/CLAUDE.md` - API endpoints
- `/app/share-hand/CLAUDE.md` - Hand sharing wizard
- `/src/CLAUDE.md` - Core application logic
- `/src/poker-engine/CLAUDE.md` - Poker engine details
- `/src/components/CLAUDE.md` - UI components
- `/src/stores/CLAUDE.md` - State management
- `/src/hooks/CLAUDE.md` - Custom hooks
- `/src/utils/CLAUDE.md` - Utility functions

## Contributing

### Development Setup

```bash
# Clone repository
git clone https://github.com/yourusername/poker-connect-hub.git

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Run development server
npm run dev
```

### Code Standards

- ESLint configuration enforced
- Prettier formatting required
- Conventional commits
- PR templates required
- Code review process mandatory

## License

This project is licensed under the MIT License. See LICENSE file for details.
