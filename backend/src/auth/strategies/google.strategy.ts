import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: '/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      console.log('Google OAuth validation started for:', profile.id);
      const { id, name, emails, photos } = profile;
      
      const googleProfile = {
        googleId: id,
        email: emails[0].value,
        name: name.givenName + ' ' + name.familyName,
        picture: photos[0].value,
      };

      console.log('Processing Google profile:', googleProfile.email);
      const user = await this.authService.validateGoogleUser(googleProfile);
      
      console.log('Google OAuth validation successful for:', user.email);
      done(null, user);
    } catch (error) {
      console.error('Google OAuth validation error:', error);
      done(error, null);
    }
  }
}