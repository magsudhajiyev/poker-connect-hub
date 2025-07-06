# Diary Entry: JWT Authentication Fix and Next.js Migration Path

**Date**: July 6, 2025
**Author**: Development Team
**Topic**: Resolving Authentication Issues and Planning Full Next.js Migration

## The Authentication Challenge

Today we resolved a critical authentication issue that was preventing users from creating shared hands. The root cause was a mismatch between two authentication systems:

1. **NextAuth.js** - Used for Google OAuth login
2. **Backend JWT System** - Used by the NestJS backend for API authentication

When users logged in via Google OAuth, NextAuth created its own session, but our API routes were expecting JWT tokens from the backend system. This created a situation where users appeared logged in on the frontend but API calls failed with "Authentication required" errors.

## The Solution

We implemented a hybrid approach that leverages the existing JWT tokens:

1. **Created `jwt-auth.ts` utility** - This reads JWT tokens from cookies and validates them
2. **Updated API routes** - Changed from using NextAuth's `auth()` to our custom `getAuthUser()` function
3. **Maintained backward compatibility** - Users with existing JWT tokens continue to work seamlessly

The key insight was that the browser was already receiving JWT tokens (`access_token` and `refresh_token` cookies) from the backend authentication flow. We just needed to use them properly in our Next.js API routes.

## Benefits of This Approach

1. **No breaking changes** - Existing users don't need to re-authenticate
2. **Unified authentication** - One source of truth for user authentication
3. **Better security** - JWT tokens are properly validated on each request
4. **Simpler architecture** - No need to sync between two auth systems

## Next.js Migration Strategy

This fix sets the foundation for a complete migration from the NestJS backend to Next.js API routes. Here's the roadmap:

### Phase 1: API Migration (Current)

- ✅ Created `/api/hands/*` endpoints in Next.js
- ✅ Implemented JWT authentication in API routes
- ✅ Connected to MongoDB using Mongoose
- ✅ Maintained API compatibility

### Phase 2: Complete Backend Migration (Next Steps)

1. **Migrate remaining endpoints**:
   - User management (`/api/users/*`)
   - Onboarding (`/api/onboarding/*`)
   - Authentication refresh (`/api/auth/refresh`)

2. **Consolidate authentication**:
   - Move JWT generation to Next.js
   - Implement refresh token rotation
   - Add rate limiting and security headers

3. **Database optimization**:
   - Add connection pooling
   - Implement caching strategy
   - Add database migrations

### Phase 3: Deprecate NestJS Backend

1. **Update environment variables**:
   - Remove `NEXT_PUBLIC_API_URL`
   - Remove backend-specific configs

2. **Clean up codebase**:
   - Remove `/backend` directory
   - Remove backend npm scripts
   - Update deployment configs

3. **Update documentation**:
   - Simplify setup instructions
   - Update architecture diagrams
   - Remove backend references

## Technical Decisions Made

1. **JWT over NextAuth Session**: We chose to use JWT tokens directly because:
   - They're already implemented and working
   - They provide stateless authentication
   - They work well with mobile apps (future consideration)

2. **Mongoose over Prisma**: Kept Mongoose because:
   - Existing schemas are already defined
   - Team familiarity
   - Better MongoDB-specific features

3. **API Route Organization**: Used nested routes (`/api/hands/create`) for:
   - Better organization
   - Clearer intent
   - Easier middleware application

## Lessons Learned

1. **Don't run two auth systems in parallel** - It creates confusion and sync issues
2. **JWT tokens in cookies work great** - They're secure and easy to validate
3. **Next.js API routes are powerful** - They can replace a full backend
4. **Migration can be incremental** - No need for a big bang approach

## Next Immediate Steps

1. Create comprehensive tests for the new API routes
2. Add error monitoring (Sentry integration)
3. Implement request validation middleware
4. Add API documentation (OpenAPI/Swagger)
5. Set up API rate limiting

This migration positions us for a simpler, more maintainable architecture while preserving all existing functionality. The unified Next.js approach will make development faster and deployment easier.
