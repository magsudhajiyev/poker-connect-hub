# App Directory

## Overview

This directory contains the Next.js 13+ App Router pages and API routes for the Poker Connect Hub application.

## Structure

### Pages

- **`/` (root)** - Landing page
- **`/feed`** - Community feed for shared poker hands
- **`/share-hand`** - Multi-step form for creating and sharing poker hands
- **`layout.tsx`** - Root layout with providers and global UI elements
- **`globals.css`** - Global styles and Tailwind CSS imports

### API Routes (`/api`)

All backend functionality is implemented using Next.js API routes:

#### Authentication

- **`/api/auth`** - NextAuth.js authentication endpoints
  - Supports Google and Facebook OAuth
  - Session management

#### Hand Management

- **`/api/hands`** - CRUD operations for poker hands
  - **`GET /api/hands`** - List all public hands
  - **`GET /api/hands/[id]`** - Get specific hand details
  - **`POST /api/hands/save-engine`** - Save hand from poker engine
  - **`/api/hands/[id]/command`** - Process poker actions via event sourcing
  - **`/api/hands/[id]/events`** - Get hand events for replay
  - **`/api/hands/[id]/valid-actions`** - Get current valid actions

#### User Management

- **`/api/users`** - User profile and statistics

#### Comments & Social

- **`/api/comments`** - Hand discussion and analysis

## Key Features

### Share Hand Page (`/share-hand`)

Multi-step wizard for hand creation:

1. Game setup (format, blinds)
2. Player positions
3. Preflop actions
4. Flop actions
5. Turn actions
6. River actions
7. Review and publish

### Feed Page (`/feed`)

- Browse community-shared hands
- Filter by tags, game type
- Social interactions (likes, comments)
- Hand analysis discussions

## Important Patterns

### Server Components

- Default to server components for better performance
- Client components marked with `'use client'`
- Lazy loading for heavy components

### Data Fetching

- Server-side data fetching in page components
- Client-side fetching with SWR for dynamic updates
- Optimistic updates for better UX

### Error Handling

- Error boundaries for graceful degradation
- Loading states with Suspense
- Custom error pages
