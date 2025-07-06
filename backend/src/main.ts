import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Cookie parser for authentication cookies
  app.use(cookieParser());

  // Session configuration
  app.use(
    session({
      secret: configService.get<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: configService.get('NODE_ENV') === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );

  // Enable CORS for frontend communication
  app.enableCors({
    origin(origin, callback) {
      const allowedOrigins = [
        'http://localhost:5173', // Vite default port
        'http://localhost:5174', // Vite alternative port
        'http://localhost:3000', // Frontend alternative port
        'http://127.0.0.1:5173', // localhost alternative
        configService.get<string>('FRONTEND_URL'),
      ].filter(Boolean);

      // In production, also allow the production domains
      if (configService.get('NODE_ENV') === 'production') {
        // Add any production domains here
        const productionDomains = configService.get<string>('ALLOWED_ORIGINS')?.split(',') || [];
        allowedOrigins.push(...productionDomains.filter(Boolean));
      }

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      // Log the origin for debugging in development
      if (configService.get('NODE_ENV') !== 'production') {
        console.warn('CORS check - Origin:', origin, 'Allowed:', allowedOrigins);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn('CORS blocked origin:', origin);
        callback(null, false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['set-cookie'],
  });

  // Enable global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Set global prefix for all routes
  app.setGlobalPrefix('');

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.warn(`🚀 Poker backend is running on: http://localhost:${port}`);
  console.warn('🔐 Auth endpoints:');
  console.warn(`   Google OAuth: http://localhost:${port}/auth/google`);
  console.warn(`   User Profile: http://localhost:${port}/auth/me`);
  console.warn(`   Logout: http://localhost:${port}/auth/logout`);
  console.warn(`📋 API endpoint: http://localhost:${port}/api/poker/actions`);
}

bootstrap();
