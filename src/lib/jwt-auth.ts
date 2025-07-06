import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getAuthUserFromSession } from './nextauth-user';

interface JWTUser {
  id: string;
  email: string;
  name: string;
  hasCompletedOnboarding: boolean;
}

export async function getAuthUser(_request?: NextRequest): Promise<JWTUser | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token');

    // If no JWT token, try NextAuth session
    if (!accessToken?.value) {
      return getAuthUserFromSession();
    }

    // If JWT_SECRET is not configured, fall back to NextAuth session
    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET not configured, using NextAuth session');
      return getAuthUserFromSession();
    }

    // Verify JWT token
    const decoded = jwt.verify(accessToken.value, process.env.JWT_SECRET) as any;

    return {
      id: decoded.id || decoded.userId || decoded.sub,
      email: decoded.email,
      name: decoded.name || decoded.email,
      hasCompletedOnboarding: decoded.hasCompletedOnboarding || false,
    };
  } catch (error) {
    console.error('JWT verification error:', error);
    // Fall back to NextAuth session on JWT error
    return getAuthUserFromSession();
  }
}
