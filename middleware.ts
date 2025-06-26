import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Define protected routes
const protectedRoutes = ['/profile', '/settings', '/share-hand', '/feed'];

export default auth((req) => {
  const pathname = req.nextUrl.pathname;

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
