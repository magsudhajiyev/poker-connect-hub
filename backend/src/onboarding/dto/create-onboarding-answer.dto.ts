import { IsString, IsEnum, IsArray, IsOptional, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export enum PlayFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  RARELY = 'rarely',
}

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  PROFESSIONAL = 'professional',
}

export enum PreferredFormat {
  CASH = 'cash',
  TOURNAMENT = 'tournament',
  BOTH = 'both',
}

export enum FavoriteVariant {
  TEXAS_HOLDEM = 'texas-holdem',
  OMAHA = 'omaha',
  STUD = 'stud',
  MIXED = 'mixed',
}

export enum LearningGoals {
  IMPROVE_STRATEGY = 'improve-strategy',
  LEARN_BASICS = 'learn-basics',
  GO_PRO = 'go-pro',
  FUN = 'fun',
}

export enum InterestedFeature {
  HAND_ANALYSIS = 'hand-analysis',
  COMMUNITY = 'community',
  STATISTICS = 'statistics',
  COACHING = 'coaching',
}

export class CreateOnboardingAnswerDto {
  @IsEnum(PlayFrequency)
  playFrequency: PlayFrequency;

  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

  @IsEnum(PreferredFormat)
  preferredFormat: PreferredFormat;

  @IsEnum(FavoriteVariant)
  favoriteVariant: FavoriteVariant;

  @IsEnum(LearningGoals)
  learningGoals: LearningGoals;

  @IsArray()
  @IsEnum(InterestedFeature, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  interestedFeatures: InterestedFeature[];

  @IsOptional()
  @IsString()
  otherInfo?: string;
}