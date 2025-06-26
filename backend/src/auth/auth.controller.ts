import {
  Controller,
  Get,
  Post,
  UseGuards,
  UnauthorizedException,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Initiates Google OAuth flow
    // Guard handles the redirect to Google
  }

  @Get('google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    try {
      const user = req.user as User;

      if (!user) {
        console.error('Google auth callback: No user object in request');
        throw new UnauthorizedException('Authentication failed - no user data');
      }

      console.log('Google auth callback: Processing user:', user.email);

      // Generate JWT tokens
      const { accessToken, refreshToken } = await this.authService.login(user);

      // Set secure HTTP-only cookies
      const isProduction = this.configService.get('NODE_ENV') === 'production';

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      console.log(
        'Google auth callback: Authentication successful, redirecting to appropriate page',
      );

      // Redirect based on onboarding status
      const redirectPath = user.hasCompletedOnboarding ? '/feed' : '/onboarding';
      res.redirect(`${frontendUrl}${redirectPath}`);
    } catch {
      console.error('Google auth callback error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      // Clear any partial cookies
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      // Determine error type for better user feedback
      let errorParam = 'authentication_failed';
      if (error.message?.includes('MongoDB') || error.message?.includes('database')) {
        errorParam = 'database_error';
      } else if (error.message?.includes('token')) {
        errorParam = 'token_error';
      }

      res.redirect(`${frontendUrl}/auth?error=${errorParam}`);
    }
  }

  @Post('refresh')
  @Public()
  async refresh(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshToken = req.cookies['refresh_token'];

      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      const { accessToken } = await this.authService.refreshToken(refreshToken);

      // Set new access token cookie
      const isProduction = this.configService.get('NODE_ENV') === 'production';

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Token refreshed successfully',
      });
    } catch {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      throw new UnauthorizedException('Token refresh failed');
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      createdAt: user.createdAt,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: User, @Res() res: Response) {
    try {
      // Remove refresh token from database
      await this.authService.logout(user.id);

      // Clear cookies
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch {
      console.error('Logout error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Logout failed',
      });
    }
  }

  @Get('status')
  @Public()
  async getAuthStatus(@Req() req: Request) {
    const accessToken = req.cookies['access_token'];

    return {
      isAuthenticated: Boolean(accessToken),
      hasToken: Boolean(accessToken),
    };
  }

  @Post('complete-onboarding')
  @UseGuards(JwtAuthGuard)
  async completeOnboarding(@CurrentUser() user: User) {
    await this.authService.completeOnboarding(user.id);

    return {
      success: true,
      message: 'Onboarding completed successfully',
    };
  }
}
