import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Define protected routes
const protectedRoutes = ['/profile', '/settings', '/share-hand', '/feed'];

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  // Skip middleware for auth callbacks to allow session establishment
  if (pathname.includes('/api/auth/callback')) {
    return NextResponse.next();
  }

  // Handle the signin page when there's a callbackUrl
  if (pathname === '/auth/signin' && req.nextUrl.searchParams.has('callbackUrl')) {
    // If user is already authenticated, redirect to the callback URL
    if (req.auth) {
      const callbackUrl = req.nextUrl.searchParams.get('callbackUrl') || '/feed';
      return NextResponse.redirect(new URL(callbackUrl, req.url));
    }
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !req.auth) {
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
     * - auth (authentication routes)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth|public).*)',
  ],
};
