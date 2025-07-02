export interface User {
  _id?: string;
  id?: string;
  googleId?: string;
  email: string;
  name: string;
  picture?: string;
  password?: string;
  authProvider: 'google' | 'email';
  refreshToken?: string;
  isActive: boolean;
  hasCompletedOnboarding: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OnboardingAnswer {
  _id?: string;
  userId: string;
  username: string; // Added username from onboarding
  playFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  preferredFormat: 'cash' | 'tournament' | 'both';
  favoriteVariant: 'texas-holdem' | 'omaha' | 'stud' | 'mixed';
  learningGoals: 'improve-strategy' | 'learn-basics' | 'go-pro' | 'fun';
  interestedFeatures: ('hand-analysis' | 'community' | 'statistics' | 'coaching')[];
  location?: string; // Added location
  preferredStakes?: string; // Added preferred stakes
  otherInfo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
