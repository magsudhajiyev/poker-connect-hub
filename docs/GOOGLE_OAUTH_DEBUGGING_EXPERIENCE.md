# Google OAuth Authentication Debugging Experience

## Overview

This document details the debugging process for fixing a complex Google OAuth authentication issue where users were stuck in an onboarding loop after signing in with Google. The issue manifested as users being redirected to the onboarding page even after completing it, receiving a 409 error "Onboarding already completed".

## The Problem

Users authenticating via Google OAuth experienced the following issues:

1. After Google sign-in, they were redirected to the landing page instead of the feed
2. The `/api/auth/me` endpoint returned success but with all undefined user data
3. Users who had already completed onboarding were forced to go through it again
4. JWT cookies were not being properly set or read after Google OAuth

## Root Cause Analysis

### 1. Response Structure Mismatch

The primary issue was a mismatch in how the API response was being parsed in the AuthContext:

**Problem:**

```typescript
// AuthContext was expecting flat response structure
if (response.data) {
  setBackendUser({
    id: response.data.id, // undefined!
    email: response.data.email, // undefined!
  });
}
```

**Reality:**

```typescript
// Actual API response structure
{
  success: true,
  data: {
    user: {
      id: "...",
      email: "...",
      hasCompletedOnboarding: true
    }
  }
}
```

### 2. Cookie Configuration Issues

The cookie settings were using `sameSite: 'none'` in production, which requires `secure: true`. However, this can cause issues if the site isn't served over HTTPS during development or if there's a protocol mismatch.

### 3. Race Conditions

The authentication flow had potential race conditions where:

- The sync request would complete but cookies weren't immediately available
- Multiple auth checks were running simultaneously
- NextAuth session and backend auth were competing

## How I Identified the Issues

### 1. Comprehensive Logging Strategy

I added detailed logging at every step of the authentication flow:

- NextAuth callbacks (signIn, jwt, session)
- Google sync endpoint
- Auth utils (token generation, cookie setting)
- AuthContext (backend auth checks, sync flow)
- API endpoints (/api/auth/me)

### 2. Tracing the Data Flow

By following the logs, I could see:

```
✅ NextAuth: Backend sync successful
✅ Google sync: User created/updated
🍪 Tokens generated and cookies set
❌ /api/auth/me: Returns undefined user data
```

This pointed to the response parsing issue.

### 3. Cookie Inspection

Added logging to show all cookies available in requests:

```typescript
const allCookies = cookieStore.getAll();
console.log(
  '🍪 All cookies:',
  allCookies.map((c) => ({
    name: c.name,
    hasValue: Boolean(c.value),
  })),
);
```

## The Solution

### 1. Fixed Response Parsing

Updated AuthContext to handle the nested response structure:

```typescript
// Before
const userData = response.data;

// After
const userData = response.data?.data?.user || response.data?.user || response.data;
```

### 2. Improved Cookie Configuration

Made cookie settings more robust:

```typescript
const isSecureContext = process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://');
const cookieOptions = {
  httpOnly: true,
  secure: isProduction && isSecureContext,
  sameSite: isProduction && isSecureContext ? 'none' : 'lax',
  path: '/',
};
```

### 3. Added Verification Step

After Google sync, added a verification call to ensure cookies were properly set:

```typescript
// After sync, verify auth cookies were set
const verifyResponse = await authEndpoints.getMe();
if (verifyUserData && verifyUserData.id) {
  console.log('✅ Auth cookies verified after sync');
}
```

## Key Learnings

### 1. Always Verify Response Structures

Never assume the shape of API responses. Always log and verify the actual structure, especially when dealing with nested data.

### 2. Cookie Debugging is Complex

Cookies involve multiple layers (client, server, browser security policies). Comprehensive logging at each layer is essential.

### 3. Race Conditions in Auth Flows

Authentication flows often have subtle race conditions. Adding verification steps and proper state management is crucial.

### 4. Development vs Production Differences

Cookie behavior can differ significantly between development and production, especially regarding secure contexts and sameSite policies.

### 5. The Power of Detailed Logging

Strategic, detailed logging at every step of the authentication flow was instrumental in identifying the issue. Without it, the undefined values would have been nearly impossible to trace.

## Debugging Checklist for Future Auth Issues

1. **Add comprehensive logging** - Log at every step with meaningful context
2. **Verify response structures** - Never assume, always check actual data shapes
3. **Check cookie settings** - Ensure secure, sameSite, and domain settings are appropriate
4. **Test in production-like environment** - Use HTTPS locally if production uses it
5. **Add verification steps** - After critical operations, verify the expected state
6. **Handle race conditions** - Use proper state management and avoid parallel auth checks
7. **Document the auth flow** - Create diagrams showing how auth data flows through the system

## Conclusion

This debugging experience reinforced the importance of systematic debugging, comprehensive logging, and never making assumptions about data structures. The issue that seemed complex (users stuck in onboarding loop) ultimately came down to a simple response parsing error, but identifying it required methodical investigation through the entire authentication flow.
