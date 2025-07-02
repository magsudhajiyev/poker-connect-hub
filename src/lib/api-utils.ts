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
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
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

  // Refresh token cookie
  response.cookies.set({
    name: 'refresh_token',
    value: tokens.refreshToken,
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

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
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return null;
  }

  const decoded = await verifyToken(token);
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
