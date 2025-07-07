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

// GET /api/users/[id]/followers - Get list of followers
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get followers with user details
    const followers = await Follow.find({ following: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'follower',
        select: 'name email image',
        model: User,
      })
      .lean();

    // Get total count for pagination
    const totalCount = await Follow.countDocuments({ following: new mongoose.Types.ObjectId(userId) });

    // Format the response
    const formattedFollowers = followers.map((follow: any) => ({
      id: follow.follower._id,
      name: follow.follower.name || 'Anonymous User',
      username: `@${follow.follower.email?.split('@')[0] || 'user'}`,
      picture: follow.follower.image || '',
      followedAt: follow.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        followers: formattedFollowers,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch followers' } },
      { status: 500 },
    );
  }
}