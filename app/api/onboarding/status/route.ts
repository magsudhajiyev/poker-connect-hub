import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuth, errorResponse, successResponse } from '@/lib/api-utils';
import { OnboardingAnswer } from '@/models/user.model';
import dbConnect from '@/lib/mongoose';
import { Follow } from '@/models/Follow';
import { SharedHand } from '@/models/SharedHand';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) {
      return authResult; // This is an error response
    }
    const currentUser = authResult;

    const db = await getDatabase();
    const onboardingCollection = db.collection<OnboardingAnswer>('onboardinganswers');

    // Find onboarding answer for current user
    const onboardingAnswer = await onboardingCollection.findOne({
      userId: currentUser.userId,
    });

    if (!onboardingAnswer) {
      return successResponse({ hasCompleted: false }, 'Onboarding not completed');
    }

    // Connect to Mongoose for follow counts
    await dbConnect();

    // Get follow counts and stats
    const [followersCount, followingCount, handsShared, totalLikes] = await Promise.all([
      Follow.countDocuments({ following: currentUser.userId }),
      Follow.countDocuments({ follower: currentUser.userId }),
      SharedHand.countDocuments({ userId: currentUser.userId, isPublic: true }),
      SharedHand.aggregate([
        { $match: { userId: currentUser.userId, isPublic: true } },
        { $project: { likesCount: { $size: '$likes' } } },
        { $group: { _id: null, total: { $sum: '$likesCount' } } },
      ]),
    ]);

    return successResponse({
      hasCompleted: true,
      onboardingData: {
        username: onboardingAnswer.username,
        playFrequency: onboardingAnswer.playFrequency,
        experienceLevel: onboardingAnswer.experienceLevel,
        preferredFormat: onboardingAnswer.preferredFormat,
        favoriteVariant: onboardingAnswer.favoriteVariant,
        learningGoals: onboardingAnswer.learningGoals,
        interestedFeatures: onboardingAnswer.interestedFeatures,
        location: onboardingAnswer.location,
        preferredStakes: onboardingAnswer.preferredStakes,
        otherInfo: onboardingAnswer.otherInfo,
        createdAt: onboardingAnswer.createdAt,
      },
      stats: {
        followersCount,
        followingCount,
        handsShared,
        likesReceived: totalLikes[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error('Onboarding status error:', error);
    return errorResponse('Internal server error', 500);
  }
}
