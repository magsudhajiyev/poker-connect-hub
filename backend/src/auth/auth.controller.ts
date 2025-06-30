import {
  Controller,
  Get,
  Post,
  UseGuards,
  UnauthorizedException,
  HttpStatus,
  Req,
  Res,
  Body,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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

      // Process user authentication

      // Generate JWT tokens
      const { accessToken, refreshToken } = await this.authService.login(user);

      // Set secure HTTP-only cookies
      const isProduction = this.configService.get('NODE_ENV') === 'production';

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Authentication successful, redirect to appropriate page

      // Redirect based on onboarding status
      const redirectPath = user.hasCompletedOnboarding ? '/feed' : '/onboarding';
      res.redirect(`${frontendUrl}${redirectPath}`);
    } catch (error) {
      console.error('Google auth callback error:', error);

      // Clear any partial cookies with proper options
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax' as const,
        path: '/',
      };
      res.clearCookie('access_token', cookieOptions);
      res.clearCookie('refresh_token', cookieOptions);

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
        path: '/',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Token refreshed successfully',
      });
    } catch {
      const isProduction = this.configService.get('NODE_ENV') === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax' as const,
        path: '/',
      };
      res.clearCookie('access_token', cookieOptions);
      res.clearCookie('refresh_token', cookieOptions);

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

      // Clear cookies with the same options they were set with
      const isProduction = this.configService.get('NODE_ENV') === 'production';
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax' as const,
        path: '/',
      };

      res.clearCookie('access_token', cookieOptions);
      res.clearCookie('refresh_token', cookieOptions);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
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

  @Post('register')
  @Public()
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    try {
      const { accessToken, refreshToken, user } = await this.authService.register(registerDto);

      // Set secure HTTP-only cookies
      const isProduction = this.configService.get('NODE_ENV') === 'production';

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Registration successful',
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        user,
      });
    } catch (error) {
      console.error('Registration error:', error);

      if (error instanceof ConflictException) {
        res.status(HttpStatus.CONFLICT).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Registration failed',
          error: error.message,
        });
      }
    }
  }

  @Post('login')
  @Public()
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const { accessToken, refreshToken, user } = await this.authService.validateEmailPassword(loginDto);

      // Set secure HTTP-only cookies
      const isProduction = this.configService.get('NODE_ENV') === 'production';

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 15 * 60 * 1000, // 15 minutes
      });

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Login successful',
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        user,
      });
    } catch (error) {
      console.error('Login error:', error);

      if (error instanceof UnauthorizedException) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          message: error.message,
        });
      } else if (error instanceof BadRequestException) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Login failed',
        });
      }
    }
  }
}
