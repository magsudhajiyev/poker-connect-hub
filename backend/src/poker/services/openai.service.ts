import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import { GameState } from '../interfaces/poker.interfaces';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      this.logger.warn('OPENAI_API_KEY environment variable is not set. OpenAI service will not function properly.');
      // Use a dummy key for testing to prevent constructor errors
      this.openai = new OpenAI({
        apiKey: 'dummy-key-for-testing',
      });
    } else {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  /**
   * Get the next game state using GPT-4 as the poker engine
   * @param gameState Current game state
   * @returns Promise<GameState> Updated game state
   */
  async getNextGameState(gameState: GameState): Promise<GameState> {
    try {
      this.logger.log(`Processing game state for game: ${gameState.gameId}`);

      // Validate input game state first
      if (!this.isValidGameState(gameState)) {
        throw new Error('Invalid game state provided to OpenAI service');
      }

      // Check if API key is available
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-testing') {
        throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.');
      }

      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(gameState);

      this.logger.debug('Sending request to OpenAI GPT-4');

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      });

      const reply = response.choices[0]?.message?.content;
      
      if (!reply) {
        throw new Error('No response received from OpenAI');
      }

      this.logger.debug('Received response from OpenAI, parsing JSON');

      // Parse the JSON response
      const nextGameState = this.parseOpenAIResponse(reply);

      // Validate the returned game state
      if (!this.isValidGameState(nextGameState)) {
        throw new Error('OpenAI returned an invalid game state');
      }

      this.logger.log(`Successfully processed game state for game: ${gameState.gameId}`);
      return nextGameState;

    } catch (error) {
      this.logger.error(`Error processing game state: ${error.message}`, error.stack);
      throw new Error(`Failed to get next game state: ${error.message}`);
    }
  }

  /**
   * Build the system prompt for the poker engine
   */
  private buildSystemPrompt(): string {
    return `You are a professional poker engine for no-limit Texas Hold'em. Your role is to:

1. Receive the current game state and determine the next logical state
2. Ensure all poker rules are strictly followed
3. Update player stacks, pot size, and betting information accurately
4. Determine the next player to act and their available actions
5. Maintain proper betting history and constraints

CRITICAL RULES:
- Players can only fold, call, check, raise, or go all-in
- Minimum raise must be at least the size of the previous raise
- Players cannot bet more chips than they have
- Pot size must equal the sum of all bets
- Current bet cannot exceed any player's total chips + current bet
- Game phases must progress logically: preflop → flop → turn → river → showdown

RESPONSE FORMAT:
Return ONLY a valid JSON object representing the updated GameState. Do not include any explanatory text.

The JSON must match this exact structure:
{
  "gameId": "string",
  "players": [array of player objects],
  "communityCards": [array of card objects],
  "pot": number,
  "currentBet": number,
  "minRaise": number,
  "bigBlind": number,
  "smallBlind": number,
  "currentPlayerIndex": number,
  "dealerPosition": number,
  "gamePhase": "preflop|flop|turn|river|showdown",
  "bettingRound": number
}`;
  }

  /**
   * Build the user prompt with the current game state
   */
  private buildUserPrompt(gameState: GameState): string {
    return `Current game state:
${JSON.stringify(gameState, null, 2)}

Please analyze this poker game state and return the next logical game state following all poker rules. Ensure:
1. All betting constraints are respected
2. Player stacks are updated correctly
3. The pot reflects all bets made
4. The next player to act is determined correctly
5. The game phase progresses appropriately

Return the updated game state as a JSON object.`;
  }

  /**
   * Parse the OpenAI response and handle potential JSON parsing errors
   */
  private parseOpenAIResponse(response: string): GameState {
    try {
      // Clean the response - remove any markdown formatting or extra text
      let cleanedResponse = response.trim();
      
      // Remove markdown code blocks if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Parse the JSON
      const parsedState = JSON.parse(cleanedResponse);
      
      return parsedState as GameState;
    } catch (error) {
      this.logger.error(`Failed to parse OpenAI response: ${error.message}`);
      this.logger.debug(`Raw response: ${response}`);
      throw new Error(`Invalid JSON response from OpenAI: ${error.message}`);
    }
  }

  /**
   * Validate that a game state object has all required properties
   */
  private isValidGameState(gameState: any): gameState is GameState {
    if (!gameState || typeof gameState !== 'object') {
      return false;
    }

    const requiredFields = [
      'gameId', 'players', 'communityCards', 'pot', 'currentBet',
      'minRaise', 'bigBlind', 'smallBlind', 'currentPlayerIndex',
      'dealerPosition', 'gamePhase', 'bettingRound',
    ];

    for (const field of requiredFields) {
      if (!(field in gameState)) {
        this.logger.warn(`Missing required field: ${field}`);
        return false;
      }
    }

    // Validate gameId is not empty
    if (!gameState.gameId || gameState.gameId.trim() === '') {
      this.logger.warn('gameId cannot be empty');
      return false;
    }

    // Validate players array
    if (!Array.isArray(gameState.players) || gameState.players.length === 0) {
      this.logger.warn('Invalid players array');
      return false;
    }

    // Validate each player has required fields
    for (const player of gameState.players) {
      const playerFields = ['id', 'name', 'chips', 'holeCards', 'position', 'isActive', 'hasActed', 'currentBet', 'isFolded', 'isAllIn'];
      for (const field of playerFields) {
        if (!(field in player)) {
          this.logger.warn(`Player missing required field: ${field}`);
          return false;
        }
      }
    }

    // Validate game phase
    const validPhases = ['preflop', 'flop', 'turn', 'river', 'showdown'];
    if (!validPhases.includes(gameState.gamePhase)) {
      this.logger.warn(`Invalid game phase: ${gameState.gamePhase}`);
      return false;
    }

    // Validate current player index
    if (gameState.currentPlayerIndex < 0 || gameState.currentPlayerIndex >= gameState.players.length) {
      this.logger.warn(`Invalid current player index: ${gameState.currentPlayerIndex}`);
      return false;
    }

    return true;
  }
}
