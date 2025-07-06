import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

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

    if (!accessToken?.value) {
      return null;
    }

    // Verify JWT token
    const decoded = jwt.verify(accessToken.value, process.env.JWT_SECRET!) as any;

    return {
      id: decoded.id || decoded.userId || decoded.sub,
      email: decoded.email,
      name: decoded.name || decoded.email,
      hasCompletedOnboarding: decoded.hasCompletedOnboarding || false,
    };
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}
