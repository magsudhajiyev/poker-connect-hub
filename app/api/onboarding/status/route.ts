import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuth, errorResponse, successResponse } from '@/lib/api-utils';
import { OnboardingAnswer } from '@/models/user.model';

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

    return successResponse({
      hasCompleted: true,
      onboardingData: {
        playFrequency: onboardingAnswer.playFrequency,
        experienceLevel: onboardingAnswer.experienceLevel,
        preferredFormat: onboardingAnswer.preferredFormat,
        favoriteVariant: onboardingAnswer.favoriteVariant,
        learningGoals: onboardingAnswer.learningGoals,
        interestedFeatures: onboardingAnswer.interestedFeatures,
        otherInfo: onboardingAnswer.otherInfo,
        createdAt: onboardingAnswer.createdAt,
      },
    });
  } catch (error) {
    console.error('Onboarding status error:', error);
    return errorResponse('Internal server error', 500);
  }
}
