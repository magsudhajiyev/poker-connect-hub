import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { errorResponse } from '@/lib/api-utils';
import { createAuthResponse } from '../../_utils';
import { User } from '@/models/user.model';

export async function POST(request: NextRequest) {
  console.log('🌐 Google sync endpoint called');

  try {
    const body = await request.json();
    const { googleId, email, name, picture } = body;

    console.log('📨 Google sync request body:', {
      googleId,
      email,
      name,
      hasProfilePic: Boolean(picture),
      pictureLength: picture?.length || 0,
    });

    // Validate input
    if (!googleId || !email || !name) {
      console.error('❌ Google sync validation failed:', {
        hasGoogleId: Boolean(googleId),
        hasEmail: Boolean(email),
        hasName: Boolean(name),
      });
      return errorResponse('Google ID, email, and name are required');
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    console.log('🔍 Searching for user with query:', {
      googleId,
      email: email.toLowerCase(),
    });

    // Check if user exists by googleId or email
    let user: User | null = await usersCollection.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    if (user) {
      console.log('✅ Found existing user in database:', {
        _id: user._id?.toString(),
        email: user.email,
        hasGoogleId: Boolean(user.googleId),
        existingGoogleId: user.googleId,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        hasCompletedOnboardingType: typeof user.hasCompletedOnboarding,
        authProvider: user.authProvider,
        isActive: user.isActive,
      });

      // Update existing user with Google info if needed
      const updateData: Partial<User> = {
        googleId,
        name,
        updatedAt: new Date(),
      };

      // Only update picture if provided and user doesn't have one
      if (picture && !user.picture) {
        updateData.picture = picture;
        console.log('📸 Adding profile picture to user');
      }

      // If user was created with email, update auth provider
      if (!user.googleId) {
        updateData.authProvider = 'google';
        console.log('🔄 Updating auth provider from email to google');
      }

      console.log('📝 Updating user with data:', {
        ...updateData,
        pictureLength: updateData.picture?.length || 0,
      });

      await usersCollection.updateOne({ _id: user._id }, { $set: updateData });

      // Merge the updates for the response
      user = { ...user, ...updateData };
      console.log('✅ User updated, final user state:', {
        _id: user._id?.toString(),
        email: user.email,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        hasCompletedOnboardingType: typeof user.hasCompletedOnboarding,
      });
    } else {
      console.log('🆕 No existing user found, creating new Google user');
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

      console.log('👤 Creating new user with data:', {
        ...newUser,
        pictureLength: newUser.picture?.length || 0,
      });

      const result = await usersCollection.insertOne(newUser as any);
      user = { ...newUser, _id: result.insertedId } as User;

      console.log('✅ New user created:', {
        _id: result.insertedId.toString(),
        email: user.email,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
      });
    }

    console.log('🎯 About to create auth response for user:', {
      _id: user._id?.toString(),
      email: user.email,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      hasCompletedOnboardingType: typeof user.hasCompletedOnboarding,
    });

    // Create standardized auth response with tokens and cookies
    const response = await createAuthResponse(user, usersCollection, 'Google sync successful');

    console.log('✅ Google sync completed successfully');
    return response;
  } catch (error) {
    console.error('💥 Google sync error:', error);
    return errorResponse('Internal server error', 500);
  }
}
