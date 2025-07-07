import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { errorResponse, hashPassword, verifyToken } from '@/lib/api-utils';
import { createUserResponse, validateUserActive } from '../_utils';
import { User } from '@/models/user.model';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Validate input
    if (!password) {
      return errorResponse('Password is required');
    }

    // Validate password strength
    if (password.length < 8) {
      return errorResponse('Password must be at least 8 characters long');
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      return errorResponse(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      );
    }

    // Get user from authentication token
    const cookieStore = request.cookies;
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return errorResponse('Authentication required', 401);
    }

    let decoded;
    try {
      decoded = await verifyToken(accessToken);
    } catch (_error) {
      return errorResponse('Invalid authentication token', 401);
    }

    if (!decoded?.userId) {
      return errorResponse('Invalid authentication token', 401);
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Find the user - convert string ID to ObjectId
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Validate user is active
    try {
      validateUserActive(user);
    } catch (error) {
      return errorResponse((error as Error).message, 403);
    }

    // Check if user already has a password
    if (user.password) {
      return errorResponse('User already has a password set', 400);
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user with password
    const updateResult = await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      },
    );

    if (updateResult.modifiedCount === 0) {
      return errorResponse('Failed to update password', 500);
    }

    // Fetch updated user data
    const updatedUser = await usersCollection.findOne({ _id: user._id });
    if (!updatedUser) {
      return errorResponse('Failed to retrieve updated user data', 500);
    }

    // Return success response with updated user data
    return createUserResponse(updatedUser, 'Password added successfully');
  } catch (error) {
    console.error('Add password error:', error);
    return errorResponse('Internal server error', 500);
  }
}
