import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser, errorResponse, successResponse } from '@/lib/api-utils';
import { User } from '@/models/user.model';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    // Get current user from JWT
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return errorResponse('Unauthorized', 401);
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Find user in database
    const user = await usersCollection.findOne({ 
      _id: new ObjectId(currentUser.userId) 
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    if (!user.isActive) {
      return errorResponse('Account is deactivated', 403);
    }

    // Return user data (excluding sensitive fields)
    const userData = {
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      picture: user.picture,
      authProvider: user.authProvider,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      googleId: user.googleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return successResponse({ user: userData });
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse('Internal server error', 500);
  }
}