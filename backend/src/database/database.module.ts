import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
        connectionFactory: (connection) => {
          connection.on('connected', () => {
            console.log('✅ MongoDB connected successfully');
          });
          
          connection.on('error', (error) => {
            console.error('❌ MongoDB connection error:', error);
          });
          
          connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected');
          });
          
          return connection;
        },
      }),
    }),
  ],
})
export class DatabaseModule {}