import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/jwt-auth';
import dbConnect from '@/lib/mongoose';
import { SharedHand } from '@/models/SharedHand';
import User from '@/models/User';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/shared-hands/[id]/like - Toggle like on a shared hand
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser(request);

    if (!authUser?.email) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentication required' } },
        { status: 401 },
      );
    }

    await dbConnect();

    const { id } = await params;

    // Find user by email
    const user = await User.findOne({ email: authUser.email });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 },
      );
    }

    const hand = await SharedHand.findById(id);

    if (!hand) {
      return NextResponse.json(
        { success: false, error: { message: 'Hand not found' } },
        { status: 404 },
      );
    }

    // Check if user already liked this hand
    const likeIndex = hand.likes.findIndex((likeId) => likeId.toString() === user._id.toString());

    if (likeIndex > -1) {
      // Unlike
      hand.likes.splice(likeIndex, 1);
    } else {
      // Like
      hand.likes.push(user._id);
    }

    await hand.save();

    return NextResponse.json({
      success: true,
      data: {
        liked: likeIndex === -1,
        likeCount: hand.likes.length,
      },
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to toggle like' } },
      { status: 500 },
    );
  }
}
