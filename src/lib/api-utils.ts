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
  // Use 'lax' for better compatibility with redirects
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction && isSecureContext,
    sameSite: 'lax' as 'none' | 'lax' | 'strict', // Changed to always use 'lax' for better compatibility
    path: '/',
    // Set explicit domain for production to ensure cookies work across subdomains
    ...(isProduction && process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
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
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieDomain = process.env.COOKIE_DOMAIN;
  
  // Clear backend JWT cookies with proper options
  const cookieOptions = {
    path: '/',
    ...(isProduction && cookieDomain ? { domain: cookieDomain } : {}),
  };
  
  response.cookies.delete({
    name: 'access_token',
    ...cookieOptions,
  });
  response.cookies.delete({
    name: 'refresh_token',
    ...cookieOptions,
  });
  
  // Clear NextAuth session cookies
  // NextAuth uses different cookie names based on environment
  const cookiesToClear = [
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.callback-url',
    '__Secure-next-auth.callback-url',
    'next-auth.csrf-token',
    '__Secure-next-auth.csrf-token',
  ];
  
  cookiesToClear.forEach(cookieName => {
    response.cookies.delete({
      name: cookieName,
      ...cookieOptions,
    });
  });
  
  // Also try to clear with domain variations
  if (isProduction) {
    const domain = process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '').split('/')[0];
    if (domain && domain !== cookieDomain) {
      cookiesToClear.forEach(cookieName => {
        response.cookies.delete({
          name: cookieName,
          path: '/',
          domain: `.${domain}`,
        });
      });
    }
  }
  
  return response;
}

// Verify JWT Token
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
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
