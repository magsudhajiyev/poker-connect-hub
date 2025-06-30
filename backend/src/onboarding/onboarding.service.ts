import { Injectable, ConflictException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OnboardingAnswer, OnboardingAnswerDocument } from '../users/entities/onboarding-answer.entity';
import { CreateOnboardingAnswerDto } from './dto/create-onboarding-answer.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectModel(OnboardingAnswer.name)
    private onboardingAnswerModel: Model<OnboardingAnswerDocument>,
    private usersService: UsersService,
  ) {}

  async submitOnboardingAnswers(userId: string, createOnboardingAnswerDto: CreateOnboardingAnswerDto): Promise<void> {
    try {
      // Check if user exists
      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if user has already completed onboarding
      if (user.hasCompletedOnboarding) {
        throw new ConflictException('User has already completed onboarding');
      }

      // Check if onboarding answers already exist for this user
      const existingAnswers = await this.onboardingAnswerModel.findOne({ userId: new Types.ObjectId(userId) });
      if (existingAnswers) {
        throw new ConflictException('Onboarding answers already exist for this user');
      }

      // Create onboarding answers
      const onboardingAnswer = new this.onboardingAnswerModel({
        userId: new Types.ObjectId(userId),
        ...createOnboardingAnswerDto,
      });

      // Start a session for transaction
      const session = await this.onboardingAnswerModel.startSession();
      session.startTransaction();

      try {
        // Save onboarding answers
        await onboardingAnswer.save({ session });

        // Update user's onboarding status
        await this.usersService.updateOnboardingStatus(userId, true);

        // Commit the transaction
        await session.commitTransaction();
      } catch (error) {
        // If anything fails, abort the transaction
        await session.abortTransaction();
        throw error;
      } finally {
        // End the session
        session.endSession();
      }
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to submit onboarding answers');
    }
  }

  async getOnboardingAnswers(userId: string): Promise<OnboardingAnswer> {
    const answers = await this.onboardingAnswerModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!answers) {
      throw new NotFoundException('Onboarding answers not found for this user');
    }
    return answers;
  }

  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    const answers = await this.onboardingAnswerModel.findOne({ userId: new Types.ObjectId(userId) });
    return !!answers;
  }
}