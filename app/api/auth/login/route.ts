import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { comparePassword, generateTokens, setAuthCookies, errorResponse, successResponse } from '@/lib/api-utils';
import { User } from '@/models/user.model';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return errorResponse('Email and password are required');
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Find user by email
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check if user has password (might be Google-only user)
    if (!user.password) {
      return errorResponse('This account uses Google sign-in. Please sign in with Google.', 400);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse('Account is deactivated', 403);
    }

    const userId = user._id!.toString();

    // Generate tokens
    const tokens = generateTokens({
      userId,
      email: user.email,
      name: user.name,
    });

    // Update refresh token in database
    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { 
          refreshToken: tokens.refreshToken,
          updatedAt: new Date()
        } 
      }
    );

    // Create response with user data
    const userData = {
      id: userId,
      email: user.email,
      name: user.name,
      picture: user.picture,
      authProvider: user.authProvider,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
    };

    // Set auth cookies and return response
    const response = successResponse(
      { user: userData, tokens },
      'Login successful'
    );

    return setAuthCookies(response, tokens);
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}