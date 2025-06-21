import { Test, TestingModule } from '@nestjs/testing';
import { OpenAIService } from './openai.service';
import { GameState } from '../interfaces/poker.interfaces';

describe('OpenAIService', () => {
  let service: OpenAIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenAIService],
    }).compile();

    service = module.get<OpenAIService>(OpenAIService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNextGameState', () => {
    const mockGameState: GameState = {
      gameId: 'test-game-123',
      players: [
        {
          id: 'player1',
          name: 'Alice',
          chips: 1000,
          holeCards: [
            { suit: 'hearts', rank: 'A' },
            { suit: 'spades', rank: 'K' },
          ],
          position: 0,
          isActive: true,
          hasActed: false,
          currentBet: 0,
          isFolded: false,
          isAllIn: false,
        },
        {
          id: 'player2',
          name: 'Bob',
          chips: 800,
          holeCards: [
            { suit: 'diamonds', rank: 'Q' },
            { suit: 'clubs', rank: 'J' },
          ],
          position: 1,
          isActive: true,
          hasActed: false,
          currentBet: 50,
          isFolded: false,
          isAllIn: false,
        },
      ],
      communityCards: [
        { suit: 'hearts', rank: '10' },
        { suit: 'diamonds', rank: '9' },
        { suit: 'spades', rank: '8' },
      ],
      pot: 150,
      currentBet: 50,
      minRaise: 50,
      bigBlind: 50,
      smallBlind: 25,
      currentPlayerIndex: 0,
      dealerPosition: 1,
      gamePhase: 'flop',
      bettingRound: 2,
    };

    it('should throw error when OPENAI_API_KEY is not set', async () => {
      // This test will pass if the API key is not set, which is expected in test environment
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-testing') {
        await expect(service.getNextGameState(mockGameState)).rejects.toThrow('OpenAI API key is not configured');
      }
    });

    it('should validate game state before processing', async () => {
      const invalidGameState = { ...mockGameState, gameId: '' };
      await expect(service.getNextGameState(invalidGameState)).rejects.toThrow('Invalid game state');
    });
  });
});
