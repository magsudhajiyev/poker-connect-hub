import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/jwt-auth';
import dbConnect from '@/lib/mongoose';
import { SharedHand } from '@/models/SharedHand';
import User from '@/models/User';

interface RouteParams {
  params: Promise<{
    id: string;
    commentId: string;
  }>;
}

// DELETE /api/hands/[id]/comments/[commentId] - Delete a specific comment
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();

    if (!authUser?.email) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentication required' } },
        { status: 401 },
      );
    }

    await dbConnect();

    const { id, commentId } = await params;

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

    // Find the comment
    const commentIndex = hand.comments.findIndex(
      (comment: any) => comment._id.toString() === commentId,
    );

    if (commentIndex === -1) {
      return NextResponse.json(
        { success: false, error: { message: 'Comment not found' } },
        { status: 404 },
      );
    }

    // Check if user owns this comment
    const comment = hand.comments[commentIndex];
    if (comment.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { success: false, error: { message: 'You can only delete your own comments' } },
        { status: 403 },
      );
    }

    // Remove the comment
    hand.comments.splice(commentIndex, 1);
    await hand.save();

    return NextResponse.json({
      success: true,
      data: {
        commentCount: hand.comments.length,
      },
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to delete comment' } },
      { status: 500 },
    );
  }
}
