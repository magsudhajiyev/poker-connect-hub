import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import {
  verifyToken,
  generateTokens,
  setAuthCookies,
  errorResponse,
  successResponse,
} from '@/lib/api-utils';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { User } from '@/models/user.model';

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return errorResponse('Refresh token not provided', 401);
    }

    // Verify refresh token
    const decoded = await verifyToken(refreshToken);
    if (!decoded) {
      return errorResponse('Invalid refresh token', 401);
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // Find user and verify refresh token matches
    const user = await usersCollection.findOne({
      _id: new ObjectId(decoded.userId),
      refreshToken,
    });

    if (!user) {
      return errorResponse('Invalid refresh token', 401);
    }

    const typedUser = user as unknown as User;
    if (!typedUser.isActive) {
      return errorResponse('Account is deactivated', 403);
    }

    const userId = typedUser._id!.toString();

    // Generate new tokens
    const tokens = generateTokens({
      userId,
      email: typedUser.email,
      name: typedUser.name,
      hasCompletedOnboarding: typedUser.hasCompletedOnboarding,
    });

    // Update refresh token in database
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          refreshToken: tokens.refreshToken,
          updatedAt: new Date(),
        },
      },
    );

    // Set auth cookies and return response
    const response = successResponse({ tokens }, 'Token refreshed successfully');

    return setAuthCookies(response, tokens);
  } catch (error) {
    console.error('Token refresh error:', error);
    return errorResponse('Internal server error', 500);
  }
}
