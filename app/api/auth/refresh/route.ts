import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyToken, errorResponse } from '@/lib/api-utils';
import { createAuthResponse } from '../_utils';
import { User } from '@/models/user.model';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // Get the refresh token from cookies
    const refreshToken = request.cookies.get('refresh_token')?.value;
    
    if (!refreshToken) {
      return errorResponse('Refresh token not provided', 401);
    }

    // Verify the refresh token
    const decoded = await verifyToken(refreshToken);
    
    if (!decoded) {
      return errorResponse('Invalid refresh token', 401);
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Find user and verify refresh token matches
    const user = await usersCollection.findOne({
      _id: new ObjectId(decoded.userId),
      refreshToken,
    });

    if (!user) {
      return errorResponse('Invalid refresh token or user not found', 401);
    }

    // Create new auth response with fresh tokens
    // This will get the latest user data including hasCompletedOnboarding status
    const response = await createAuthResponse(
      user,
      usersCollection,
      'Token refreshed successfully',
    );

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return errorResponse('Failed to refresh token', 500);
  }
}