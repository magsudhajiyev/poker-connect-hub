# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a poker hand analysis and sharing platform called "Poker Connect Hub" built with Next.js (React/TypeScript). The application allows users to recreate poker hands, analyze them, and share with the community.

**IMPORTANT ARCHITECTURAL DECISION**: This project uses Next.js for both frontend and backend functionality. Do NOT use the separate NestJS backend - all API functionality should be implemented using Next.js API routes in the `src/app/api/` directory. This keeps everything in one source, simplifies deployment, and avoids CORS issues.

## Development Commands

### Next.js Commands

- `npm run dev` - Start Next.js development server (includes API routes)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Legacy Commands (DO NOT USE)

- The following commands are for the NestJS backend which we no longer use:
  - `npm run backend:dev`
  - `npm run backend:build`
  - `npm run backend:start`
  - `npm run dev:all`

## Architecture

### Frontend Structure

- **Components**: React components organized by feature areas (share-hand, poker-table, etc.)
- **Hooks**: Custom React hooks for business logic (usePokerGameEngine, useShareHandLogic, etc.)
- **Utils**: Core poker game logic and utilities
- **Stores**: Zustand state management
- **Services**: API communication layer

### Backend Structure (Next.js API Routes)

- **API Routes**: Located in `src/app/api/` directory
- **Route Handlers**: Next.js 13+ App Router API routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js for unified authentication

### Key Game Engine Components

- `PokerGameEngine` (src/utils/PokerGameEngine.ts): Core poker game logic for hand recreation
- `ShareHandProvider` (src/components/share-hand/ShareHandProvider.tsx): Context provider for hand sharing workflow
- API Routes in `src/app/api/poker/` for poker action validation

### State Management

- Frontend uses React Context API with custom hooks
- API routes use Next.js route handlers
- Game state flows through ShareHandProvider context

### UI Framework

- Tailwind CSS for styling
- shadcn/ui components for consistent design system
- Radix UI primitives for accessibility

## Development Notes

### Hand Sharing Workflow

The hand sharing feature is the core functionality, following a multi-step process:

1. Game setup (players, blinds, positions)
2. Preflop actions
3. Flop cards and actions
4. Turn card and actions
5. River card and actions

### Poker Logic

- Game engine supports standard poker rules and betting actions
- Position-based action ordering (UTG, MP, etc.)
- Blind posting and betting round management
- All-in and side pot calculations

### API Integration

- Next.js API routes provide poker action validation endpoints
- All API routes are under `/api/` path
- OpenAI integration for hand analysis (in development)
- RESTful API design with proper error handling
- No CORS configuration needed as frontend and API are on the same origin
