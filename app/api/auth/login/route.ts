import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { comparePassword, errorResponse } from '@/lib/api-utils';
import { createAuthResponse, validateUserActive } from '../_utils';
import { User } from '@/models/user.model';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return errorResponse('Email and password are required');
    }

    // Log if there's an existing session (for debugging)
    const cookieStore = request.cookies;
    const hasExistingSession = cookieStore.get('access_token') || cookieStore.get('refresh_token');
    
    if (hasExistingSession) {
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

    // Validate user is active
    try {
      validateUserActive(user);
    } catch (error) {
      return errorResponse((error as Error).message, 403);
    }

    // Create standardized auth response with tokens and cookies
    // This will also update the refresh token in the database
    return await createAuthResponse(user, usersCollection, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
}
