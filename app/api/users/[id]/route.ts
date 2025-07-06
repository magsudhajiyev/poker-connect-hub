import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { SharedHand } from '@/models/SharedHand';

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
    const user = await User.findById(id)
      .select('name email image authProvider createdAt hasCompletedOnboarding')
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 },
      );
    }

    // Get user's shared hands statistics
    const [totalHands, totalLikes, totalComments] = await Promise.all([
      SharedHand.countDocuments({ userId: id, isPublic: true }),
      SharedHand.aggregate([
        { $match: { userId: (user as any)._id, isPublic: true } },
        { $project: { likesCount: { $size: '$likes' } } },
        { $group: { _id: null, total: { $sum: '$likesCount' } } },
      ]),
      SharedHand.aggregate([
        { $match: { userId: (user as any)._id, isPublic: true } },
        { $project: { commentsCount: { $size: '$comments' } } },
        { $group: { _id: null, total: { $sum: '$commentsCount' } } },
      ]),
    ]);

    // Get user's recent hands
    const recentHands = await SharedHand.find({ userId: id, isPublic: true })
      .select('title description gameType gameFormat createdAt likes comments')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Add computed fields to recent hands
    const recentHandsWithCounts = recentHands.map((hand: any) => ({
      ...hand,
      likeCount: hand.likes?.length || 0,
      commentCount: hand.comments?.length || 0,
    }));

    const profileData = {
      user: {
        _id: (user as any)._id,
        name: (user as any).name,
        email: (user as any).email,
        image: (user as any).image,
        authProvider: (user as any).authProvider,
        createdAt: (user as any).createdAt,
        hasCompletedOnboarding: (user as any).hasCompletedOnboarding,
      },
      stats: {
        totalHands,
        totalLikes: totalLikes[0]?.total || 0,
        totalComments: totalComments[0]?.total || 0,
        memberSince: (user as any).createdAt,
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
