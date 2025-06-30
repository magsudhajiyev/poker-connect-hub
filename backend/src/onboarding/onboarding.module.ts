import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingAnswer, OnboardingAnswerSchema } from '../users/entities/onboarding-answer.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: OnboardingAnswer.name, schema: OnboardingAnswerSchema }]),
    UsersModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}