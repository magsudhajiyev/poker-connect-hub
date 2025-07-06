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

// GET /api/shared-hands/[id] - Get a single shared hand
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await dbConnect();

    // Ensure User model is registered
    // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
    User;

    const hand = await SharedHand.findById(id)
      .populate('userId', 'name email image')
      .populate('comments.userId', 'name email picture')
      .lean();

    if (!hand) {
      return NextResponse.json(
        { success: false, error: { message: 'Hand not found' } },
        { status: 404 },
      );
    }

    // Increment view count
    await SharedHand.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    // Add computed fields
    const handWithCounts = {
      ...hand,
      likeCount: hand.likes?.length || 0,
      commentCount: hand.comments?.length || 0,
    };

    return NextResponse.json({
      success: true,
      data: handWithCounts,
    });
  } catch (error) {
    console.error('Error fetching shared hand:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to fetch shared hand' },
      },
      { status: 500 },
    );
  }
}

// PATCH /api/shared-hands/[id] - Update a shared hand
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    // Find the hand first to check ownership
    const hand = await SharedHand.findById(id).populate('userId');

    if (!hand) {
      return NextResponse.json(
        { success: false, error: { message: 'Hand not found' } },
        { status: 404 },
      );
    }

    // Check if user owns this hand
    const handUser = hand.userId as { email: string };
    if (handUser.email !== authUser.email) {
      return NextResponse.json(
        { success: false, error: { message: 'You can only update your own hands' } },
        { status: 403 },
      );
    }

    const body = await request.json();

    const updated = await SharedHand.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true },
    )
      .populate('userId', 'name email image')
      .populate('comments.userId', 'name email picture')
      .lean();

    // Add computed fields
    const updatedWithCounts = {
      ...updated,
      likeCount: updated?.likes?.length || 0,
      commentCount: updated?.comments?.length || 0,
    };

    return NextResponse.json({
      success: true,
      data: updatedWithCounts,
    });
  } catch (error) {
    console.error('Error updating shared hand:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to update shared hand' } },
      { status: 500 },
    );
  }
}

// DELETE /api/shared-hands/[id] - Delete a shared hand
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Find the hand first to check ownership
    const hand = await SharedHand.findById(id).populate('userId');

    if (!hand) {
      return NextResponse.json(
        { success: false, error: { message: 'Hand not found' } },
        { status: 404 },
      );
    }

    // Check if user owns this hand
    const handUser = hand.userId as { email: string };
    if (handUser.email !== authUser.email) {
      return NextResponse.json(
        { success: false, error: { message: 'You can only delete your own hands' } },
        { status: 403 },
      );
    }

    await SharedHand.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Hand deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting shared hand:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to delete shared hand' } },
      { status: 500 },
    );
  }
}
