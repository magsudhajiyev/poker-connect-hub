import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword, errorResponse } from '@/lib/api-utils';
import { createAuthResponse } from './_utils';
import { User } from '@/models/user.model';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password || !name) {
      return errorResponse('Email, password, and name are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse('Invalid email format');
    }

    // Validate password strength
    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters long');
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser: Omit<User, '_id' | 'id'> = {
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      authProvider: 'email',
      isActive: true,
      hasCompletedOnboarding: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser as any);
    
    // Get the created user with _id
    const createdUser = { ...newUser, _id: result.insertedId } as User;

    // Create standardized auth response with tokens and cookies
    return await createAuthResponse(createdUser, usersCollection, 'Registration successful');
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('Internal server error', 500);
  }
}