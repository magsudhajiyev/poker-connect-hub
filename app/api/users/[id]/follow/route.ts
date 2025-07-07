import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/jwt-auth';
import dbConnect from '@/lib/mongoose';
import { Follow } from '@/models/Follow';
import User from '@/models/User';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST /api/users/[id]/follow - Follow a user
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();

    if (!authUser?.email) {
      return NextResponse.json(
        { success: false, error: { message: 'Authentication required' } },
        { status: 401 },
      );
    }

    await dbConnect();

    const { id: targetUserId } = await params;

    // Get the authenticated user
    const follower = await User.findOne({ email: authUser.email });
    if (!follower) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 },
      );
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: { message: 'Target user not found' } },
        { status: 404 },
      );
    }

    // Prevent self-following
    if (follower._id.toString() === targetUserId) {
      return NextResponse.json(
        { success: false, error: { message: 'You cannot follow yourself' } },
        { status: 400 },
      );
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: follower._id,
      following: new mongoose.Types.ObjectId(targetUserId),
    });

    if (existingFollow) {
      return NextResponse.json(
        { success: false, error: { message: 'Already following this user' } },
        { status: 400 },
      );
    }

    // Create follow relationship
    await Follow.create({
      follower: follower._id,
      following: new mongoose.Types.ObjectId(targetUserId),
    });

    // Get updated counts
    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ following: new mongoose.Types.ObjectId(targetUserId) }),
      Follow.countDocuments({ follower: new mongoose.Types.ObjectId(targetUserId) }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        isFollowing: true,
        followersCount,
        followingCount,
      },
    });
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to follow user' } },
      { status: 500 },
    );
  }
}

// DELETE /api/users/[id]/follow - Unfollow a user
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

    const { id: targetUserId } = await params;

    // Get the authenticated user
    const follower = await User.findOne({ email: authUser.email });
    if (!follower) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 },
      );
    }

    // Delete follow relationship
    const result = await Follow.findOneAndDelete({
      follower: follower._id,
      following: new mongoose.Types.ObjectId(targetUserId),
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: { message: 'Not following this user' } },
        { status: 400 },
      );
    }

    // Get updated counts
    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ following: new mongoose.Types.ObjectId(targetUserId) }),
      Follow.countDocuments({ follower: new mongoose.Types.ObjectId(targetUserId) }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        isFollowing: false,
        followersCount,
        followingCount,
      },
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to unfollow user' } },
      { status: 500 },
    );
  }
}

// GET /api/users/[id]/follow - Check if following a user
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const authUser = await getAuthUser();

    await dbConnect();

    const { id: targetUserId } = await params;

    let isFollowing = false;

    if (authUser?.email) {
      const follower = await User.findOne({ email: authUser.email });
      if (follower) {
        const follow = await Follow.findOne({
          follower: follower._id,
          following: new mongoose.Types.ObjectId(targetUserId),
        });
        isFollowing = Boolean(follow);
      }
    }

    // Get counts
    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ following: new mongoose.Types.ObjectId(targetUserId) }),
      Follow.countDocuments({ follower: new mongoose.Types.ObjectId(targetUserId) }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        isFollowing,
        followersCount,
        followingCount,
      },
    });
  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to check follow status' } },
      { status: 500 },
    );
  }
}