# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a poker hand analysis and sharing platform called "Poker Connect Hub" built with React/TypeScript frontend and NestJS backend. The application allows users to recreate poker hands, analyze them, and share with the community.

## Development Commands

### Frontend (React/Vite)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend (NestJS)
- `npm run backend:dev` - Start backend in development mode
- `npm run backend:build` - Build backend
- `npm run backend:start` - Start backend in production mode
- `npm run backend:install` - Install backend dependencies

### Full Stack
- `npm run dev:all` - Run both frontend and backend concurrently

### Testing
- Backend: `cd backend && npm run test` - Run Jest tests
- Backend: `cd backend && npm run test:watch` - Run tests in watch mode
- Backend: `cd backend && npm run test:e2e` - Run end-to-end tests

## Architecture

### Frontend Structure
- **Components**: React components organized by feature areas (share-hand, poker-table, etc.)
- **Hooks**: Custom React hooks for business logic (usePokerGameEngine, useShareHandLogic, etc.)
- **Utils**: Core poker game logic and utilities
- **Stores**: Zustand state management
- **Services**: API communication layer

### Backend Structure
- **NestJS Modules**: Organized by domain (poker module)
- **Services**: Business logic layer
- **Controllers**: HTTP endpoint handlers
- **DTOs**: Data transfer objects for API contracts
- **Interfaces**: TypeScript interfaces for type safety

### Key Game Engine Components
- `PokerGameEngine` (src/utils/PokerGameEngine.ts): Core poker game logic for hand recreation
- `ShareHandProvider` (src/components/share-hand/ShareHandProvider.tsx): Context provider for hand sharing workflow
- `PokerService` (backend/src/poker/poker.service.ts): Backend service for poker action validation

### State Management
- Frontend uses React Context API with custom hooks
- Backend uses NestJS dependency injection
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
- Backend provides poker action validation endpoints
- OpenAI integration for hand analysis (in development)
- RESTful API design with proper error handling