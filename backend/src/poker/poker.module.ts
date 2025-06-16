import { Module } from '@nestjs/common';
import { PokerController } from './poker.controller';
import { PokerService } from './poker.service';
import { OpenAIService } from './services/openai.service';

@Module({
  controllers: [PokerController],
  providers: [PokerService, OpenAIService],
  exports: [PokerService, OpenAIService],
})
export class PokerModule {}
