# Migration to Next.js API Routes

This document outlines the migration from a separate NestJS backend to Next.js API routes.

## Overview

We've migrated from a separate backend service architecture to Next.js API routes to enable single deployment on Vercel. This simplifies the deployment process and reduces infrastructure complexity.

## What Changed

### 1. API Routes Structure
- **Before**: Separate NestJS backend running on port 3001
- **After**: Next.js API routes in `/app/api/*`

### 2. API Endpoints
All endpoints have been migrated from `/api/backend/*` to `/api/*`:

#### Authentication Endpoints
- `/api/backend/auth/register` → `/api/auth/register`
- `/api/backend/auth/login` → `/api/auth/login`
- `/api/backend/auth/logout` → `/api/auth/logout`
- `/api/backend/auth/me` → `/api/auth/me`
- `/api/backend/auth/google/sync` → `/api/auth/google/sync`
- `/api/backend/auth/refresh` → `/api/auth/refresh`

#### Onboarding Endpoints
- `/api/backend/onboarding/submit` → `/api/onboarding/submit`
- `/api/backend/onboarding/status` → `/api/onboarding/status`

### 3. Environment Variables
- **Removed**: `NEXT_PUBLIC_API_URL` (no longer needed)
- **Added**: `JWT_SECRET` for API authentication
- **Added**: `MONGODB_URI` for database connection

### 4. Authentication Flow
The authentication flow remains the same:
1. NextAuth handles Google OAuth
2. On successful Google sign-in, it syncs with our API (`/api/auth/google/sync`)
3. JWT tokens are generated and stored in httpOnly cookies
4. All API requests use these cookies for authentication

## Deployment Instructions

### Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

### Production (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your production URL)
   - `NEXT_PUBLIC_APP_URL` (set to your production URL)
   - `MONGODB_URI`
   - `JWT_SECRET`
4. Deploy

## Benefits
1. **Single Deployment**: Everything deploys together on Vercel
2. **Simplified Infrastructure**: No need for separate backend hosting
3. **Better Performance**: API routes run on the same server as the frontend
4. **Easier Development**: No need to run multiple services locally
5. **Cost Effective**: Single hosting solution instead of multiple services

## Rollback Plan
If you need to rollback to the separate backend architecture:
1. Checkout the commit before the migration
2. Re-enable the proxy configuration in `next.config.js`
3. Deploy the backend separately
4. Update `NEXT_PUBLIC_API_URL` to point to the backend

## Next Steps
- Remove the `/backend` folder once migration is verified working
- Update any remaining documentation
- Consider migrating poker game logic to API routes as well