import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(_request: NextRequest) {
  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();

  // Look for NextAuth session cookies
  const sessionCookies = allCookies.filter(
    (c) =>
      c.name.includes('authjs') ||
      c.name.includes('next-auth') ||
      c.name.includes('__Secure-authjs') ||
      c.name.includes('__Host-authjs'),
  );

  return NextResponse.json({
    allCookies: allCookies.map((c) => ({
      name: c.name,
      hasValue: Boolean(c.value),
      length: c.value?.length,
    })),
    sessionCookies: sessionCookies.map((c) => ({
      name: c.name,
      hasValue: Boolean(c.value),
    })),
    hasCookies: allCookies.length > 0,
    hasSessionCookies: sessionCookies.length > 0,
  });
}
