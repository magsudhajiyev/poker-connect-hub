import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { requireAuth, errorResponse, successResponse } from '@/lib/api-utils';
import { OnboardingAnswer } from '@/models/user.model';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) {
      return authResult; // This is an error response
    }
    const currentUser = authResult;

    const body = await request.json();
    const {
      username,
      playFrequency,
      experienceLevel,
      preferredFormat,
      favoriteVariant,
      learningGoals,
      interestedFeatures,
      location,
      preferredStakes,
      otherInfo,
    } = body;

    // Validate required fields
    if (
      !username ||
      !playFrequency ||
      !experienceLevel ||
      !preferredFormat ||
      !favoriteVariant ||
      !learningGoals
    ) {
      return errorResponse('All required fields must be provided');
    }

    // Validate enum values
    const validPlayFrequencies = ['daily', 'weekly', 'monthly', 'rarely'];
    const validExperienceLevels = ['beginner', 'intermediate', 'advanced', 'professional'];
    const validFormats = ['cash', 'tournament', 'both'];
    const validVariants = ['texas-holdem', 'omaha', 'stud', 'mixed'];
    const validGoals = ['improve-strategy', 'learn-basics', 'go-pro', 'fun'];
    const validFeatures = ['hand-analysis', 'community', 'statistics', 'coaching'];

    if (!validPlayFrequencies.includes(playFrequency)) {
      return errorResponse('Invalid play frequency');
    }
    if (!validExperienceLevels.includes(experienceLevel)) {
      return errorResponse('Invalid experience level');
    }
    if (!validFormats.includes(preferredFormat)) {
      return errorResponse('Invalid preferred format');
    }
    if (!validVariants.includes(favoriteVariant)) {
      return errorResponse('Invalid favorite variant');
    }
    if (!validGoals.includes(learningGoals)) {
      return errorResponse('Invalid learning goals');
    }
    if (interestedFeatures && !Array.isArray(interestedFeatures)) {
      return errorResponse('Interested features must be an array');
    }
    if (interestedFeatures && !interestedFeatures.every((f: string) => validFeatures.includes(f))) {
      return errorResponse('Invalid interested features');
    }

    const db = await getDatabase();
    const onboardingCollection = db.collection<OnboardingAnswer>('onboardinganswers');
    const usersCollection = db.collection('users');

    // Check if user already completed onboarding
    const existingAnswer = await onboardingCollection.findOne({
      userId: currentUser.userId,
    });

    if (existingAnswer) {
      return errorResponse('Onboarding already completed', 409);
    }

    // Create onboarding answer
    const onboardingAnswer: Omit<OnboardingAnswer, '_id'> = {
      userId: currentUser.userId,
      username,
      playFrequency,
      experienceLevel,
      preferredFormat,
      favoriteVariant,
      learningGoals,
      interestedFeatures: interestedFeatures || [],
      location,
      preferredStakes,
      otherInfo,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert onboarding answer
    await onboardingCollection.insertOne(onboardingAnswer as any);

    // Update user's onboarding status
    await usersCollection.updateOne(
      { _id: new ObjectId(currentUser.userId) },
      {
        $set: {
          hasCompletedOnboarding: true,
          updatedAt: new Date(),
        },
      },
    );

    return successResponse({ onboardingAnswer }, 'Onboarding completed successfully');
  } catch (error) {
    console.error('Onboarding submission error:', error);
    return errorResponse('Internal server error', 500);
  }
}
