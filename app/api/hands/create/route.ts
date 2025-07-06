import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/jwt-auth';
import dbConnect from '@/lib/mongoose';
import { SharedHand } from '@/models/SharedHand';
import User from '@/models/User';

// POST /api/hands/create - Create a new hand
export async function POST(request: NextRequest) {
  try {
    // Get user from JWT token
    const authUser = await getAuthUser(request);
    // Auth user from JWT

    if (!authUser?.email) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentication required' } },
        { status: 401 },
      );
    }

    await dbConnect();

    const body = await request.json();
    // Request body

    // Find user by email
    let user = await User.findOne({ email: authUser.email });
    // Found user

    if (!user) {
      // If user doesn't exist, create one
      const newUser = await User.create({
        email: authUser.email,
        name: authUser.name || 'Anonymous',
        authProvider: 'email',
        hasCompletedOnboarding: authUser.hasCompletedOnboarding,
      });
      // Created new user
      user = newUser;
    }

    // Create shared hand
    const sharedHand = await SharedHand.create({
      ...body,
      userId: user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      likes: [],
    });

    // Populate user data before returning
    const populated = await SharedHand.findById(sharedHand._id)
      .populate('userId', 'name email image')
      .lean();

    return NextResponse.json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error('Error creating shared hand:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to create shared hand' },
      },
      { status: 500 },
    );
  }
}
