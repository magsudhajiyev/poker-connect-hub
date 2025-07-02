import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { errorResponse, successResponse } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username || typeof username !== 'string') {
      return errorResponse('Username is required');
    }

    // Validate username format
    if (username.length < 3) {
      return errorResponse('Username must be at least 3 characters');
    }

    if (username.length > 20) {
      return errorResponse('Username must be less than 20 characters');
    }

    // Check if username contains only allowed characters (alphanumeric, underscore, dash)
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return errorResponse('Username can only contain letters, numbers, underscores, and dashes');
    }

    const db = await getDatabase();
    const onboardingCollection = db.collection('onboardinganswers');

    // Check if username already exists (case-insensitive)
    const existingUser = await onboardingCollection.findOne({
      username: { $regex: new RegExp(`^${username}$`, 'i') },
    });

    if (existingUser) {
      return successResponse({ available: false }, 'Username is already taken');
    }

    return successResponse({ available: true }, 'Username is available');
  } catch (error) {
    console.error('Username check error:', error);
    return errorResponse('Internal server error', 500);
  }
}
