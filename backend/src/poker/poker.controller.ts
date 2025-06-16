import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { PokerService } from './poker.service';
import { GetLegalActionsDto } from './dto/game-state.dto';
import { LegalActionsResponse } from './interfaces/poker.interfaces';

@Controller('api/poker')
export class PokerController {
  constructor(private readonly pokerService: PokerService) {}

  @Post('actions')
  getLegalActions(@Body() getLegalActionsDto: GetLegalActionsDto): LegalActionsResponse {
    try {
      const { gameState, playerId } = getLegalActionsDto;

      // Validate the game state
      if (!this.pokerService.validateGameState(gameState)) {
        throw new HttpException(
          'Invalid game state provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Get legal actions for the current player
      const result = this.pokerService.getLegalActions(gameState, playerId);

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          message: 'Failed to calculate legal actions',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
