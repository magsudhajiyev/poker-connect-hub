import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Follow } from '@/models/Follow';
import User from '@/models/User';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/users/[id]/following - Get list of users being followed
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get following with user details
    const following = await Follow.find({ follower: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'following',
        select: 'name email image',
        model: User,
      })
      .lean();

    // Get total count for pagination
    const totalCount = await Follow.countDocuments({ follower: new mongoose.Types.ObjectId(userId) });

    // Format the response
    const formattedFollowing = following.map((follow: any) => ({
      id: follow.following._id,
      name: follow.following.name || 'Anonymous User',
      username: `@${follow.following.email?.split('@')[0] || 'user'}`,
      picture: follow.following.image || '',
      followedAt: follow.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        following: formattedFollowing,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch following' } },
      { status: 500 },
    );
  }
}