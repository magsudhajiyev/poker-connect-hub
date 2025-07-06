import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedHandsService } from './shared-hands.service';
import { SharedHandsController } from './shared-hands.controller';
import { SharedHand, SharedHandSchema } from './entities/shared-hand.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SharedHand.name, schema: SharedHandSchema }]),
    UsersModule,
  ],
  controllers: [SharedHandsController],
  providers: [SharedHandsService],
  exports: [SharedHandsService],
})
export class SharedHandsModule {}
