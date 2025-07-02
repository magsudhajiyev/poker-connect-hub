import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser, errorResponse } from '@/lib/api-utils';
import { createUserResponse, validateUserActive } from '../_utils';
import { ObjectId } from 'mongodb';
import { User } from '@/models/user.model';

export async function GET(request: NextRequest) {
  console.log('🔍 /api/auth/me endpoint called');

  try {
    // Get current user from JWT
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      console.log('❌ /api/auth/me: No current user from JWT');
      return errorResponse('Unauthorized', 401);
    }

    console.log('✅ /api/auth/me: Found current user from JWT:', {
      userId: currentUser.userId,
      email: currentUser.email,
      hasCompletedOnboarding: currentUser.hasCompletedOnboarding,
      hasCompletedOnboardingType: typeof currentUser.hasCompletedOnboarding,
    });

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    // Find user in database
    const user = await usersCollection.findOne({
      _id: new ObjectId(currentUser.userId),
    });

    if (!user) {
      console.log('❌ /api/auth/me: User not found in database for ID:', currentUser.userId);
      return errorResponse('User not found', 404);
    }

    console.log('✅ /api/auth/me: Found user in database:', {
      _id: user._id?.toString(),
      email: user.email,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      hasCompletedOnboardingType: typeof user.hasCompletedOnboarding,
      isActive: user.isActive,
    });

    // Validate user is active
    try {
      validateUserActive(user as unknown as User);
    } catch (error) {
      console.log('❌ /api/auth/me: User validation failed:', (error as Error).message);
      return errorResponse((error as Error).message, 403);
    }

    console.log('✅ /api/auth/me: About to create user response');
    // Return standardized user data
    const response = createUserResponse(user as unknown as User);

    console.log('✅ /api/auth/me: Response created successfully');
    return response;
  } catch (error) {
    console.error('💥 /api/auth/me error:', error);
    return errorResponse('Internal server error', 500);
  }
}
