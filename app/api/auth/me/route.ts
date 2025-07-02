import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser, errorResponse } from '@/lib/api-utils';
import { createUserResponse, validateUserActive } from '../_utils';
import { ObjectId } from 'mongodb';
import { User } from '@/models/user.model';

export async function GET(request: NextRequest) {
  try {
    // Get current user from JWT
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return errorResponse('Unauthorized', 401);
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // Find user in database
    const user = await usersCollection.findOne({
      _id: new ObjectId(currentUser.userId),
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Validate user is active
    try {
      validateUserActive(user as unknown as User);
    } catch (error) {
      return errorResponse((error as Error).message, 403);
    }

    // Return standardized user data
    return createUserResponse(user as unknown as User);
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse('Internal server error', 500);
  }
}
