import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { SharedHand } from '@/models/SharedHand';
import { Follow } from '@/models/Follow';
import mongoose, { Types } from 'mongoose';

// Type definitions
interface UserDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  image?: string;
  authProvider: 'google' | 'email';
  createdAt: Date;
  hasCompletedOnboarding: boolean;
}

// interface SharedHandDocument {
//   _id: Types.ObjectId;
//   title: string;
//   description?: string;
//   gameType: string;
//   gameFormat: string;
//   createdAt: Date;
//   likes?: Types.ObjectId[];
//   comments?: Array<{ _id: Types.ObjectId; [key: string]: unknown }>;
// }

interface AggregateResult {
  _id: null;
  total: number;
}

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/users/[id] - Get user profile data
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await dbConnect();

    const { id } = await params;

    // Find user by ID
    const user = (await User.findById(id)
      .select('name email image authProvider createdAt hasCompletedOnboarding')
      .lean()) as UserDocument | null;

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 },
      );
    }

    // Get user's shared hands statistics and follow counts
    const [totalHands, totalLikes, totalComments, followersCount, followingCount] =
      await Promise.all([
        SharedHand.countDocuments({ userId: id, isPublic: true }),
        SharedHand.aggregate<AggregateResult>([
          { $match: { userId: user._id, isPublic: true } },
          { $project: { likesCount: { $size: '$likes' } } },
          { $group: { _id: null, total: { $sum: '$likesCount' } } },
        ]),
        SharedHand.aggregate<AggregateResult>([
          { $match: { userId: user._id, isPublic: true } },
          { $project: { commentsCount: { $size: '$comments' } } },
          { $group: { _id: null, total: { $sum: '$commentsCount' } } },
        ]),
        Follow.countDocuments({ following: new mongoose.Types.ObjectId(id) }),
        Follow.countDocuments({ follower: new mongoose.Types.ObjectId(id) }),
      ]);

    // Get user's recent hands
    const recentHands = await SharedHand.find({
      userId: new mongoose.Types.ObjectId(id),
      isPublic: true,
    })
      .select('title description gameType gameFormat createdAt likes comments')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Add computed fields to recent hands
    // TODO: Replace any with proper Mongoose lean type when available
    const recentHandsWithCounts = (recentHands as any[]).map((hand) => ({
      ...hand,
      likeCount: hand.likes?.length || 0,
      commentCount: hand.comments?.length || 0,
    }));

    const typedUser = user as UserDocument;
    const profileData = {
      user: {
        _id: typedUser._id,
        name: typedUser.name,
        email: typedUser.email,
        image: typedUser.image,
        authProvider: typedUser.authProvider,
        createdAt: typedUser.createdAt,
        hasCompletedOnboarding: typedUser.hasCompletedOnboarding,
      },
      stats: {
        totalHands,
        totalLikes: totalLikes[0]?.total || 0,
        totalComments: totalComments[0]?.total || 0,
        followersCount,
        followingCount,
        memberSince: typedUser.createdAt,
      },
      recentHands: recentHandsWithCounts,
    };

    return NextResponse.json({
      success: true,
      data: profileData,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch user profile' } },
      { status: 500 },
    );
  }
}
