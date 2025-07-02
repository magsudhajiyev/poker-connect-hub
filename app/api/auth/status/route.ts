import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser, errorResponse } from '@/lib/api-utils';
import { createUserResponse, validateUserActive } from '../_utils';
import { User } from '@/models/user.model';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return errorResponse('Not authenticated', 401);
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Find user in database
    const user = await usersCollection.findOne({
      _id: new ObjectId(currentUser.userId),
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Validate user is active
    try {
      validateUserActive(user);
    } catch (error) {
      return errorResponse((error as Error).message, 403);
    }

    // Return user status data
    return createUserResponse(user, 'Auth status retrieved successfully');
  } catch (error) {
    console.error('Auth status error:', error);
    return errorResponse('Internal server error', 500);
  }
}
