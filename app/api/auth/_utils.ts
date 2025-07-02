import { NextResponse } from 'next/server';
import { User } from '@/models/user.model';
import { generateTokens, setAuthCookies } from '@/lib/api-utils';

// Standardized user response interface
export interface AuthUserResponse {
  id: string;
  email: string;
  name: string;
  picture?: string;
  authProvider: string;
  hasCompletedOnboarding: boolean;
  googleId?: string;
  createdAt: string;
  updatedAt: string;
}

// Standardized auth response interface
export interface AuthResponse {
  user: AuthUserResponse;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Format user data consistently across all auth endpoints
 */
export function formatUserData(user: User): AuthUserResponse {
  return {
    id: user._id!.toString(),
    email: user.email,
    name: user.name,
    picture: user.picture,
    authProvider: user.authProvider,
    hasCompletedOnboarding: user.hasCompletedOnboarding,
    googleId: user.googleId,
    createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

/**
 * Create auth response with tokens and set cookies
 * Also updates the refresh token in the database
 */
export async function createAuthResponse(
  user: User,
  usersCollection?: any,
  message: string = 'Authentication successful',
): Promise<NextResponse> {
  const userData = formatUserData(user);
  const userId = userData.id;

  // Generate tokens
  const tokens = generateTokens({
    userId,
    email: user.email,
    name: user.name,
    hasCompletedOnboarding: user.hasCompletedOnboarding,
  });

  // Update refresh token in database if collection is provided
  if (usersCollection) {
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          refreshToken: tokens.refreshToken,
          updatedAt: new Date(),
        },
      },
    );
  }

  // Create response
  const responseData = {
    success: true,
    message,
    data: {
      user: userData,
      tokens,
    },
  };

  const response = NextResponse.json(responseData);

  // Set auth cookies
  return setAuthCookies(response, tokens);
}

/**
 * Create user data response without tokens (for /me endpoint)
 */
export function createUserResponse(
  user: User,
  message: string = 'User data retrieved successfully',
): NextResponse {
  const userData = formatUserData(user);

  return NextResponse.json({
    success: true,
    message,
    data: {
      user: userData,
    },
  });
}

/**
 * Validate user activity status
 */
export function validateUserActive(user: User): void {
  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }
}

/**
 * Common user fields to update on auth operations
 */
export function getAuthUpdateFields() {
  return {
    updatedAt: new Date(),
  };
}
