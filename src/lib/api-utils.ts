import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Types
export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  hasCompletedOnboarding?: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
}

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';
const JWT_EXPIRES_IN = '59m';
const JWT_REFRESH_EXPIRES_IN = '7d';

// Error Response Helper
export function errorResponse(error: ApiError | string, statusCode = 400) {
  if (typeof error === 'string') {
    return NextResponse.json({ success: false, message: error }, { status: statusCode });
  }
  return NextResponse.json(
    { success: false, message: error.message, code: error.code },
    { status: error.statusCode || statusCode },
  );
}

// Success Response Helper
export function successResponse(data?: any, message?: string) {
  return NextResponse.json({
    success: true,
    ...(message && { message }),
    ...(data && { data }),
  });
}

// Generate JWT Tokens
export function generateTokens(payload: JwtPayload) {
  console.log('🔑 generateTokens called with payload:', {
    userId: payload.userId,
    email: payload.email,
    hasCompletedOnboarding: payload.hasCompletedOnboarding,
    hasCompletedOnboardingType: typeof payload.hasCompletedOnboarding,
  });

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

  console.log('🔑 Tokens generated successfully:', {
    accessTokenLength: accessToken.length,
    refreshTokenLength: refreshToken.length,
  });

  return { accessToken, refreshToken };
}

// Set Auth Cookies
export function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) {
  const isProduction = process.env.NODE_ENV === 'production';
  const isSecureContext = process.env.NEXT_PUBLIC_APP_URL?.startsWith('https://') || false;

  console.log('🍪 setAuthCookies called:', {
    isProduction,
    isSecureContext,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    hasAccessToken: Boolean(tokens.accessToken),
    hasRefreshToken: Boolean(tokens.refreshToken),
    accessTokenLength: tokens.accessToken.length,
    refreshTokenLength: tokens.refreshToken.length,
  });

  // For production, we need to be careful with sameSite and secure flags
  // If the site is served over HTTPS, use 'none' for cross-site requests
  // Otherwise, use 'lax' to avoid cookie issues
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction && isSecureContext,
    sameSite: (isProduction && isSecureContext ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
    path: '/',
  };

  // Access token cookie
  response.cookies.set({
    name: 'access_token',
    value: tokens.accessToken,
    ...cookieOptions,
    maxAge: 60 * 59, // 59 minutes
  });

  console.log('🍪 Access token cookie set with options:', cookieOptions);

  // Refresh token cookie
  response.cookies.set({
    name: 'refresh_token',
    value: tokens.refreshToken,
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  console.log('🍪 Refresh token cookie set with options:', cookieOptions);

  return response;
}

// Clear Auth Cookies
export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  return response;
}

// Verify JWT Token
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

// Get current user from request
export async function getCurrentUser(_request: NextRequest): Promise<JwtPayload | null> {
  console.log('🔍 getCurrentUser called');

  const cookieStore = await cookies();

  // Log all cookies for debugging
  const allCookies = cookieStore.getAll();
  console.log(
    '🍪 getCurrentUser: All cookies:',
    allCookies.map((c) => ({
      name: c.name,
      hasValue: Boolean(c.value),
      valueLength: c.value?.length || 0,
    })),
  );

  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    console.log('❌ getCurrentUser: No access_token cookie found');
    return null;
  }

  console.log('🔍 getCurrentUser: Found access_token, verifying...', {
    tokenLength: token.length,
    tokenPrefix: `${token.substring(0, 20)}...`,
  });

  const decoded = await verifyToken(token);

  if (decoded) {
    console.log('✅ getCurrentUser: Token verified:', {
      userId: decoded.userId,
      email: decoded.email,
      hasCompletedOnboarding: decoded.hasCompletedOnboarding,
      hasCompletedOnboardingType: typeof decoded.hasCompletedOnboarding,
    });
  } else {
    console.log('❌ getCurrentUser: Token verification failed');
  }

  return decoded;
}

// Auth middleware for protected routes
export async function requireAuth(request: NextRequest): Promise<JwtPayload | NextResponse> {
  const user = await getCurrentUser(request);

  if (!user) {
    return errorResponse('Unauthorized', 401);
  }

  return user;
}

// Hash password (using bcrypt)
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
  return bcrypt.hash(password, saltRounds);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hashedPassword);
}
