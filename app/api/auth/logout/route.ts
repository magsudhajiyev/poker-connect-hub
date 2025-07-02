import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser, clearAuthCookies, errorResponse, successResponse } from '@/lib/api-utils';
import { User } from '@/models/user.model';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // Get current user (optional - logout should work even with invalid token)
    const currentUser = await getCurrentUser(request);

    // If we have a valid user, invalidate their refresh token
    if (currentUser) {
      try {
        const db = await getDatabase();
        const usersCollection = db.collection<User>('users');

        // Clear refresh token in database
        await usersCollection.updateOne(
          { _id: new ObjectId(currentUser.userId) },
          { 
            $unset: { refreshToken: 1 },
            $set: { updatedAt: new Date() }
          }
        );
      } catch (dbError) {
        console.error('Failed to clear refresh token from database:', dbError);
        // Continue with logout even if database update fails
      }
    }

    // Create response and clear cookies
    const response = successResponse(null, 'Logout successful');
    return clearAuthCookies(response);

  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, clear cookies and return success
    // This ensures logout always works from the client perspective
    const response = successResponse(null, 'Logout completed');
    return clearAuthCookies(response);
  }
}