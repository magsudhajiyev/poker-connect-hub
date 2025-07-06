import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { verifyTokenEdge, type JwtPayload } from '@/lib/edge-jwt';

// Define protected routes
const protectedRoutes = ['/profile', '/settings', '/share-hand', '/feed', '/onboarding'];

// Routes that require completed onboarding
const onboardingRequiredRoutes = ['/feed', '/share-hand', '/profile'];

// Wrap the auth middleware to add custom logic
export default auth(async (req) => {
  const pathname = req.nextUrl.pathname;
  
  // Skip authentication checks for static assets and API routes that handle auth
  const isAuthEndpoint = pathname.startsWith('/api/auth/');
  const isStaticAsset = pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js)$/);
  
  if (isAuthEndpoint || isStaticAsset) {
    return NextResponse.next();
  }

  // Check for logout parameter
  const isLogout = req.nextUrl.searchParams.get('logout') === 'true';

  // If logout parameter is present, don't do any redirects
  if (isLogout) {
    return NextResponse.next();
  }

  // Skip middleware for auth-related API routes
  if (pathname.includes('/api/auth')) {
    return NextResponse.next();
  }

  // Check for backend JWT cookie and validate it
  const accessTokenCookie = req.cookies.get('access_token');
  let jwtPayload: JwtPayload | null = null;
  let hasValidBackendAuth = false;

  if (accessTokenCookie?.value) {
    try {
      jwtPayload = await verifyTokenEdge(accessTokenCookie.value);
      hasValidBackendAuth = Boolean(jwtPayload);
    } catch {
      hasValidBackendAuth = false;
    }
  }

  // Check for NextAuth session
  const hasNextAuthSession = Boolean(req.auth);

  // User is authenticated if they have either valid auth method
  const isAuthenticated = hasNextAuthSession || hasValidBackendAuth;
  
  // Check if this is a fresh login attempt (coming from signin page)
  const referer = req.headers.get('referer');
  const isFromSignin = referer && referer.includes('/auth/signin');
  const isFreshLogin = isFromSignin || req.headers.get('x-fresh-login') === 'true';
  
  // Allow grace period for cookie propagation on fresh logins
  if (isFreshLogin && protectedRoutes.some(route => pathname.startsWith(route))) {
    // Set a header to track this is a fresh login navigation
    const response = NextResponse.next();
    response.headers.set('x-fresh-login-allowed', 'true');
    return response;
  }
  


  // Handle the signin page
  if (pathname === '/auth/signin') {
    // Check if this is coming from a logout or the home page
    const referer = req.headers.get('referer');
    const isFromLogout =
      referer &&
      referer.includes(req.nextUrl.origin) &&
      (referer.includes('/settings') ||
        referer.includes('/') ||
        referer === `${req.nextUrl.origin}/`);

    // Check for logout query parameter (we'll add this in logout flow)
    const isLogout = req.nextUrl.searchParams.get('logout') === 'true';

    // If user is already authenticated and NOT coming from logout, redirect to feed or callback URL
    if (isAuthenticated && !isFromLogout && !isLogout) {
      // Verify the auth token is actually valid
      if (hasValidBackendAuth && jwtPayload) {
        const callbackUrl = req.nextUrl.searchParams.get('callbackUrl') || '/feed';
        return NextResponse.redirect(new URL(callbackUrl, req.url));
      } else if (hasNextAuthSession) {
        const callbackUrl = req.nextUrl.searchParams.get('callbackUrl') || '/feed';
        return NextResponse.redirect(new URL(callbackUrl, req.url));
      }
    }

    // If coming from logout, allow access to signin page
    if (isFromLogout || isLogout) {
      // Allow access
    }
  }

  // Check if route requires onboarding to be completed
  const requiresOnboarding = onboardingRequiredRoutes.some((route) => pathname.startsWith(route));

  // If authenticated and on a route that requires onboarding, check onboarding status
  if (isAuthenticated && requiresOnboarding && hasValidBackendAuth && jwtPayload) {
    // Check if user has completed onboarding from JWT payload
    if (jwtPayload.hasCompletedOnboarding === false) {
      // Special case: if coming from onboarding page with fresh tokens, allow access
      const referer = req.headers.get('referer');
      const isFromOnboarding = referer && referer.includes('/onboarding');
      
      if (isFromOnboarding) {
        // Allow the request to proceed to let new tokens be validated
        return NextResponse.next();
      }
      
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    // Check if this might be a fresh login (referrer is signin page)
    const referer = req.headers.get('referer');
    if (referer && referer.includes('/auth/signin')) {
      // Allow the request to proceed once to let cookies settle
      const response = NextResponse.next();
      response.headers.set('x-fresh-login-allowed', 'true');
      return response;
    }

    // Also check if we're coming from a login API call
    // This helps with cookie propagation timing
    const isFromAuthAPI = referer && (referer.includes('/api/auth/login') || referer.includes('/api/auth/register'));
    if (isFromAuthAPI) {
      return NextResponse.next();
    }
    
    // Check for RSC navigation from signin (Next.js server component requests)
    const isRSCRequest = req.headers.get('rsc') || req.nextUrl.searchParams.has('_rsc');
    if (isRSCRequest && referer && referer.includes('/auth/signin')) {
      const response = NextResponse.next();
      response.headers.set('x-fresh-login-allowed', 'true');
      return response;
    }

    const url = new URL('/auth/signin', req.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
