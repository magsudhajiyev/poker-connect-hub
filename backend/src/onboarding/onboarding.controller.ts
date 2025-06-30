import { Controller, Post, Get, Body, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { CreateOnboardingAnswerDto } from './dto/create-onboarding-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  async submitOnboarding(@Request() req, @Body() createOnboardingAnswerDto: CreateOnboardingAnswerDto) {
    await this.onboardingService.submitOnboardingAnswers(req.user.userId, createOnboardingAnswerDto);
    return {
      success: true,
      message: 'Onboarding completed successfully',
    };
  }

  @Get('answers')
  async getOnboardingAnswers(@Request() req) {
    const answers = await this.onboardingService.getOnboardingAnswers(req.user.userId);
    return {
      success: true,
      data: answers,
    };
  }

  @Get('status')
  async getOnboardingStatus(@Request() req) {
    const hasCompleted = await this.onboardingService.hasCompletedOnboarding(req.user.userId);
    return {
      success: true,
      hasCompletedOnboarding: hasCompleted,
    };
  }
}