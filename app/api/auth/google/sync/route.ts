import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { errorResponse } from '@/lib/api-utils';
import { ObjectId } from 'mongodb';
import { createAuthResponse } from '../../_utils';
import { User } from '@/models/user.model';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { googleId, email, name, picture } = body;

    // Validate input
    if (!googleId || !email || !name) {
      return errorResponse('Google ID, email, and name are required');
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Important: Clear any existing auth cookies before creating new session
    // This prevents the issue where previous user's session might persist
    const cookieStore = request.cookies;
    const hasExistingSession = cookieStore.get('access_token') || cookieStore.get('refresh_token');

    if (hasExistingSession) {
      // Get the existing user ID from the token to properly clear their session
      const existingToken = cookieStore.get('access_token')?.value;
      if (existingToken) {
        try {
          const { verifyToken } = await import('@/lib/api-utils');
          const decoded = await verifyToken(existingToken);
          if (decoded && decoded.userId) {
            // Clear the refresh token for the previous user
            await usersCollection.updateOne(
              { _id: new ObjectId(decoded.userId) },
              {
                $unset: { refreshToken: 1 },
                $set: { updatedAt: new Date() },
              },
            );
          }
        } catch (error) {
          console.error('Error clearing previous user session:', error);
        }
      }
    }

    // Check if user exists by googleId or email
    let user: User | null = await usersCollection.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    if (user) {
      // Update existing user with Google info if needed
      const updateData: Partial<User> = {
        googleId,
        name,
        updatedAt: new Date(),
      };

      // Only update picture if provided and user doesn't have one
      if (picture && !user.picture) {
        updateData.picture = picture;
      }

      // If user was created with email, update auth provider
      if (!user.googleId) {
        updateData.authProvider = 'google';
      }

      await usersCollection.updateOne({ _id: user._id }, { $set: updateData });

      // Merge the updates for the response
      user = { ...user, ...updateData };
    } else {
      // Create new user
      const newUser: Omit<User, '_id' | 'id'> = {
        googleId,
        email: email.toLowerCase(),
        name,
        picture,
        authProvider: 'google',
        isActive: true,
        hasCompletedOnboarding: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await usersCollection.insertOne(newUser as any);
      user = { ...newUser, _id: result.insertedId } as User;
    }

    // Create standardized auth response with tokens and cookies
    return await createAuthResponse(user, usersCollection, 'Google sync successful');
  } catch {
    return errorResponse('Internal server error', 500);
  }
}
