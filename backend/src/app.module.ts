import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PokerModule } from './poker/poker.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { SharedHandsModule } from './shared-hands/shared-hands.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    OnboardingModule,
    PokerModule,
    SharedHandsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
