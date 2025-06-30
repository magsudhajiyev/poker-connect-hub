import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Define protected routes
const protectedRoutes = ['/profile', '/settings', '/share-hand', '/feed'];

// Routes that require completed onboarding
const onboardingRequiredRoutes = ['/feed', '/share-hand', '/profile'];

// Wrap the auth middleware to add custom logic
export default auth(async (req) => {
  const pathname = req.nextUrl.pathname;

  // Skip middleware for auth-related API routes
  if (pathname.includes('/api/auth')) {
    return NextResponse.next();
  }

  // Check for backend JWT cookie
  const hasBackendAuth = req.cookies.has('access_token');

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
    // If user is already authenticated, redirect to feed or callback URL
    if (isAuthenticated) {
      const callbackUrl = req.nextUrl.searchParams.get('callbackUrl') || '/feed';
      console.log('User already authenticated, redirecting to:', callbackUrl);
      return NextResponse.redirect(new URL(callbackUrl, req.url));
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
