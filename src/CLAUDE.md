# Src Directory

## Overview

Core application logic, utilities, and shared components for Poker Connect Hub. This directory contains the business logic layer separated from the presentation layer.

## Directory Structure

### `/components`

Reusable UI components used across the application:

- **CardInput** - Poker card selection with validation
- **UI components** - Shadcn/ui based design system
- **Form controls** - Specialized poker inputs

### `/hooks`

Custom React hooks for business logic:

- **useShareHandLogic** - Hand sharing workflow state
- **usePlayerManagement** - Player CRUD operations
- **usePokerGameEngine** - Game engine integration
- **useShareHand** - Legacy hand sharing logic

### `/lib`

Utility libraries and configurations:

- **connectMongoDB** - Database connection management
- **utils** - Helper functions (cn, formatting)
- **NextAuth configuration** - Authentication setup

### `/models`

Mongoose schemas for MongoDB:

- **SharedHand** - Main hand document
- **HandEvent** - Event sourcing events
- **User** - User profiles
- **Comment** - Hand discussions

### `/poker-engine`

**Core poker game engine** - The heart of the application:

- Rule validation
- State management
- Action processing
- Event sourcing

### `/services`

Business logic services:

- **CommentService** - Comment CRUD operations
- **SharedHandService** - Hand management
- API integrations

### `/stores`

Zustand state management:

- **poker-hand-store** - Central game state
- **useAuthStore** - Authentication state
- Global application state

### `/types`

TypeScript type definitions:

- **poker.ts** - Core poker types (Action, Street, Position)
- **shareHand.ts** - Hand sharing types
- **event-sourcing.ts** - Event types
- API response types

### `/utils`

Utility functions:

- **shareHandConstants** - Poker constants
- **shareHandUtils** - Helper functions
- **positionUtils** - Seat/position logic
- **pokerHelpers** - Game calculations
- **formatters** - Display formatting

## Key Components

### Poker Engine (`/poker-engine`)

The most critical part of the application:

#### Core Engine

- **engine.ts** - Main game engine
- **state.ts** - Game state management
- **rules.ts** - Poker rule validation
- **events.ts** - Event definitions

#### Adapters

- **EventSourcingAdapter** - Persistence layer
- Bridges engine with database

#### Services

- **HandBuilderService** - Construct hands
- State reconstruction from events

### State Management (`/stores/poker-hand-store.ts`)

Central store managing:

- Current game state
- Player information
- Action history
- UI synchronization

### Type System (`/types`)

Strong typing throughout:

```typescript
export enum ActionType {
  FOLD = 'fold',
  CHECK = 'check',
  CALL = 'call',
  BET = 'bet',
  RAISE = 'raise',
  ALL_IN = 'all-in',
}
```

## Important Patterns

### Event Sourcing

- All game actions stored as events
- State reconstructed from event log
- Complete audit trail

### Separation of Concerns

- UI components isolated from business logic
- Engine independent of persistence
- Clear service boundaries

### Type Safety

- Comprehensive TypeScript usage
- Runtime validation with Zod
- Strict null checks

### Performance Optimization

- Memoized components
- Optimized re-renders
- Lazy loading
