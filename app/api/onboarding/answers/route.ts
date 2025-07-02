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

    // Find user's onboarding answers
    const onboardingAnswer = await onboardingCollection.findOne({ 
      userId: currentUser.userId 
    });

    if (!onboardingAnswer) {
      return errorResponse('Onboarding answers not found', 404);
    }

    // Return onboarding answers (excluding internal fields)
    const responseData = {
      playFrequency: onboardingAnswer.playFrequency,
      experienceLevel: onboardingAnswer.experienceLevel,
      preferredFormat: onboardingAnswer.preferredFormat,
      favoriteVariant: onboardingAnswer.favoriteVariant,
      learningGoals: onboardingAnswer.learningGoals,
      interestedFeatures: onboardingAnswer.interestedFeatures,
      otherInfo: onboardingAnswer.otherInfo,
      createdAt: onboardingAnswer.createdAt,
      updatedAt: onboardingAnswer.updatedAt,
    };

    return successResponse(
      { onboardingAnswer: responseData },
      'Onboarding answers retrieved successfully'
    );
    
  } catch (error) {
    console.error('Get onboarding answers error:', error);
    return errorResponse('Internal server error', 500);
  }
}