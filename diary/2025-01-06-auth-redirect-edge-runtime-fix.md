# Developer Diary: January 6, 2025

## Project: Poker Connect Hub - Authentication Redirect and Edge Runtime Fix

### Challenge Faced

The application had a complex authentication redirect issue that manifested in multiple ways:

1. **Initial Issue**: Email/password login succeeded on backend but users weren't redirected
2. **Session Mixing**: Logging out and logging in with Google showed previous user's data
3. **Registration Flow**: New users could register but couldn't login - stuck on auth page
4. **Edge Runtime Error**: JWT verification failed with "The edge runtime does not support Node.js 'crypto' module"
5. **Cookie Timing**: Race conditions between cookie setting and navigation

### Root Cause Analysis

The core issue was **Edge Runtime incompatibility** with the `jsonwebtoken` library. The middleware runs in Edge Runtime which has limited Node.js API support. This caused:

- JWT verification to fail silently
- Middleware to reject valid authentication
- Redirect loops as users were seen as unauthenticated
- Cookie verification to fail despite cookies being set

### Solution Implemented

#### 1. **Edge-Compatible JWT Library**

Created `/src/lib/edge-jwt.ts` using `jose` library:

```typescript
import { jwtVerify, SignJWT } from 'jose';

// Edge Runtime compatible JWT verification
export async function verifyTokenEdge(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as JwtPayload;
  } catch (error) {
    return null;
  }
}
```

#### 2. **Cookie Verification Utility**

Created `/src/utils/cookieVerification.ts` to verify cookies before navigation:

```typescript
export async function waitForCookiesWithVerification(maxAttempts = 5): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const verified = await verifyCookiesSet();
    if (verified) return true;
  }
  return false;
}
```

#### 3. **Enhanced Middleware Grace Periods**

Added fresh login detection to allow cookie propagation:

```typescript
const isFromSignin = referer && referer.includes('/auth/signin');
const isFreshLogin = isFromSignin || req.headers.get('x-fresh-login') === 'true';

if (isFreshLogin && protectedRoutes.some(route => pathname.startsWith(route))) {
  const response = NextResponse.next();
  response.headers.set('x-fresh-login-allowed', 'true');
  return response;
}
```

#### 4. **Hard Navigation for Auth Changes**

Changed from `router.push` to `window.location.href`:

```typescript
// Use window.location for hard navigation to ensure cookies are sent
// This is more reliable than router.push for auth state changes
window.location.href = redirectUrl;
```

#### 5. **Comprehensive Logout**

Fixed session mixing by clearing all auth state:

```typescript
// Clear backend user state immediately to prevent stale data
setBackendUser(null);

// Always call both logout methods to ensure complete session clearing
await authEndpoints.logout();
await authEndpoints.signout();
```

### Key Learnings

1. **Edge Runtime Limitations**: Not all Node.js APIs work in Edge Runtime. Always check compatibility when working with Next.js middleware.

2. **The Power of Root Cause Analysis**: The issue seemed like a cookie/timing problem but was actually an Edge Runtime compatibility issue. Finding the root cause led to a simple, effective fix.

3. **Cookie Propagation Timing**: Browser cookie setting is asynchronous. Navigation must account for this timing to prevent race conditions.

4. **Hard vs Soft Navigation**: For authentication state changes, `window.location.href` is more reliable than Next.js router navigation as it ensures a full page reload with fresh cookies.

5. **Trust the Error Messages**: The "edge runtime does not support Node.js 'crypto' module" error was the key to solving everything, but it was buried in the logs.

### Self-Evaluation

**What Went Well:**

- ✅ Eventually identified the Edge Runtime issue as root cause
- ✅ Created a clean, reusable edge-jwt utility
- ✅ Fixed all authentication flows comprehensively
- ✅ Maintained backward compatibility with existing code
- ✅ Added proper cookie verification before navigation

**What Could Be Improved:**

- ❌ Took too long to check the actual error messages in logs
- ❌ Initially focused on symptoms (timing, cookies) rather than root cause
- ❌ Added unnecessary complexity (delays, retries) before finding real issue
- ❌ Should have checked Edge Runtime compatibility earlier

**Lessons for Future:**

1. Always check runtime environment constraints first
2. Read error messages carefully - they often point to the solution
3. Don't add complexity to work around problems - fix the root cause
4. Test in the actual deployment environment, not just development
5. When debugging auth issues, check every layer of the stack

### Technical Details

**Files Created:**

- `/src/lib/edge-jwt.ts` - Edge Runtime compatible JWT utilities
- `/src/utils/cookieVerification.ts` - Cookie verification helpers

**Files Modified:**

- `/middleware.ts` - Use edge-jwt for verification, add grace periods
- `/app/auth/signin/SignInForm.tsx` - Hard navigation, cookie verification
- `/src/contexts/AuthContext.tsx` - Comprehensive logout, immediate state clearing
- `/app/onboarding/page.tsx` - Delayed auth check to prevent premature redirects

**Time Taken:** ~4 hours (multiple iterations due to misdiagnosed root cause)

**Complexity Level:** High (involved debugging across multiple layers)

### Debugging Timeline

1. **Hour 1**: Focused on cookie timing, added delays
2. **Hour 2**: Investigated session mixing, enhanced logout
3. **Hour 3**: Found Edge Runtime error in logs, switched to jose library
4. **Hour 4**: Cleaned up code, removed debug logs, verified all flows

### User Feedback Quotes

- "I have a small bug in the authentication flow" - Started simple
- "It's very weird. Now after your changes I refreshed the page and immediately system took me through the onboarding" - Cookie persistence was working
- "See, was it so hard to detect?" - User knew the fix was simple once root cause was found

### Critical Fix That Solved Everything

```typescript
// Before (in middleware.ts):
import jwt from 'jsonwebtoken'; // ❌ Not Edge Runtime compatible

// After:
import { verifyTokenEdge } from '@/lib/edge-jwt'; // ✅ Uses jose library
```

This single change made everything work. All the timing issues, redirect loops, and authentication failures were symptoms of JWT verification silently failing in Edge Runtime.

### Tomorrow's Focus

- Monitor for any edge cases in production
- Consider adding Edge Runtime compatibility checks to CI/CD
- Document Edge Runtime limitations for team
- Create a troubleshooting guide for auth issues

---

_Note to self: When nothing makes sense and you've tried everything, go back and read the error messages carefully. The answer is often hiding in plain sight. Edge Runtime compatibility is a common gotcha in Next.js applications._