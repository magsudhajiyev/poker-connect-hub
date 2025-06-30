import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OnboardingAnswerDocument = OnboardingAnswer & Document;

@Schema({ timestamps: true })
export class OnboardingAnswer {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  playFrequency: string; // 'daily', 'weekly', 'monthly', 'rarely'

  @Prop({ required: true })
  experienceLevel: string; // 'beginner', 'intermediate', 'advanced', 'professional'

  @Prop({ required: true })
  preferredFormat: string; // 'cash', 'tournament', 'both'

  @Prop({ required: true })
  favoriteVariant: string; // 'texas-holdem', 'omaha', 'stud', 'mixed'

  @Prop({ required: true })
  learningGoals: string; // 'improve-strategy', 'learn-basics', 'go-pro', 'fun'

  @Prop({ type: [String], default: [] })
  interestedFeatures: string[]; // ['hand-analysis', 'community', 'statistics', 'coaching']

  @Prop()
  otherInfo?: string; // Optional additional information

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const OnboardingAnswerSchema = SchemaFactory.createForClass(OnboardingAnswer);

// Add index for faster queries by userId
OnboardingAnswerSchema.index({ userId: 1 });