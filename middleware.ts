import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Define protected routes
const protectedRoutes = ['/profile', '/settings', '/share-hand', '/feed'];

// Routes that require completed onboarding
const onboardingRequiredRoutes = ['/feed', '/share-hand', '/profile'];

// Wrap the auth middleware to add custom logic
export default auth(async (req) => {
  const pathname = req.nextUrl.pathname;
  
  // Check for logout parameter
  const isLogout = req.nextUrl.searchParams.get('logout') === 'true';
  
  // If logout parameter is present, don't do any redirects
  if (isLogout) {
    console.log('Logout parameter detected, allowing access without redirects');
    return NextResponse.next();
  }

  // Skip middleware for auth-related API routes
  if (pathname.includes('/api/auth')) {
    return NextResponse.next();
  }

  // Check for backend JWT cookie
  const accessTokenCookie = req.cookies.get('access_token');
  const hasBackendAuth = Boolean(accessTokenCookie?.value);

  // Check for NextAuth session
  const hasNextAuthSession = Boolean(req.auth);

  // User is authenticated if they have either auth method
  const isAuthenticated = hasNextAuthSession || hasBackendAuth;

  // Log authentication state for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware check:', {
      path: pathname,
      hasBackendAuth,
      hasNextAuthSession,
      isAuthenticated,
      cookies: req.cookies.getAll().map(c => c.name),
    });
  }

  // Handle the signin page
  if (pathname === '/auth/signin') {
    // Check if this is coming from a logout or the home page
    const referer = req.headers.get('referer');
    const isFromLogout = referer && referer.includes(req.nextUrl.origin) && 
      (referer.includes('/settings') || referer.includes('/') || referer === req.nextUrl.origin + '/');
    
    // Check for logout query parameter (we'll add this in logout flow)
    const isLogout = req.nextUrl.searchParams.get('logout') === 'true';
    
    // If user is already authenticated and NOT coming from logout, redirect to feed or callback URL
    if (isAuthenticated && !isFromLogout && !isLogout) {
      // Verify the auth token is actually valid by checking if it's not empty
      if (hasBackendAuth && accessTokenCookie?.value && accessTokenCookie.value.length > 10) {
        const callbackUrl = req.nextUrl.searchParams.get('callbackUrl') || '/feed';
        console.log('User already authenticated, redirecting to:', callbackUrl);
        return NextResponse.redirect(new URL(callbackUrl, req.url));
      } else if (hasNextAuthSession) {
        const callbackUrl = req.nextUrl.searchParams.get('callbackUrl') || '/feed';
        console.log('User already authenticated via NextAuth, redirecting to:', callbackUrl);
        return NextResponse.redirect(new URL(callbackUrl, req.url));
      }
    }
    
    // If coming from logout, allow access to signin page
    if (isFromLogout || isLogout) {
      console.log('User coming from logout, allowing access to signin page');
    }
  }

  // Check if route requires onboarding to be completed
  const requiresOnboarding = onboardingRequiredRoutes.some((route) => pathname.startsWith(route));

  // If authenticated and on a route that requires onboarding, check onboarding status
  if (isAuthenticated && requiresOnboarding && hasBackendAuth) {
    // For now, we'll need to check this on the client side
    // as middleware can't make API calls to check onboarding status
    // The AuthContext will handle the redirect
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    // Check if this might be a fresh login (referrer is signin page)
    const referer = req.headers.get('referer');
    if (referer && referer.includes('/auth/signin')) {
      console.log('Fresh login detected, allowing one-time access to verify cookies');
      // Allow the request to proceed once to let cookies settle
      return NextResponse.next();
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
