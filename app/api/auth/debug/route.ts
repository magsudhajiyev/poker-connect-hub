import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get the session
    const session = await auth();

    // Get cookies for debugging
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('__Secure-next-auth.session-token');
    const csrfToken = cookieStore.get('authjs.csrf-token');
    const callbackUrl = cookieStore.get('authjs.callback-url');

    // Prepare debug information
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        hasGoogleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
        hasGoogleClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
        hasNextAuthSecret: Boolean(process.env.NEXTAUTH_SECRET),
      },
      session: {
        exists: Boolean(session),
        user: session?.user
          ? {
              email: session.user.email,
              name: session.user.name,
              hasImage: Boolean(session.user.image),
            }
          : null,
      },
      cookies: {
        sessionTokenExists: Boolean(sessionToken),
        sessionTokenName: sessionToken?.name,
        csrfTokenExists: Boolean(csrfToken),
        callbackUrlExists: Boolean(callbackUrl),
        callbackUrlValue: callbackUrl?.value,
      },
      headers: {
        host: process.env.VERCEL_URL || 'unknown',
        referer: cookieStore.get('referer')?.value || 'none',
      },
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Debug endpoint error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
