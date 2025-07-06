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

// POST /api/hands/[id]/comments - Add a comment to a shared hand
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
    const { content } = await request.json();

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { message: 'Comment content is required' } },
        { status: 400 },
      );
    }

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

    // Add the comment
    const newComment = {
      userId: user._id,
      content: content.trim(),
      createdAt: new Date(),
    };

    hand.comments.push(newComment);
    await hand.save();

    // Populate the new comment's user data before returning
    const populatedHand = await SharedHand.findById(id)
      .populate('comments.userId', 'name email picture')
      .lean();

    const addedComment = (populatedHand as any)?.comments[
      (populatedHand as any)?.comments.length - 1
    ];

    return NextResponse.json({
      success: true,
      data: {
        comment: addedComment,
        commentCount: (populatedHand as any)?.comments?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to add comment' } },
      { status: 500 },
    );
  }
}
