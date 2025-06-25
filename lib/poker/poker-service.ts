import { GameState, PokerAction, LegalActionsResponse, Player } from './interfaces';

class PokerService {
  /**
   * Validate if a game state is valid
   */
  validateGameState(gameState: GameState): boolean {
    if (!gameState || !gameState.players || gameState.players.length < 2) {
      return false;
    }
    
    // Check if all required fields are present
    if (typeof gameState.pot !== 'number' || 
        typeof gameState.currentBet !== 'number' ||
        typeof gameState.bigBlind !== 'number') {
      return false;
    }
    
    return true;
  }
  
  /**
   * Calculate legal actions for the current player in the given game state
   */
  getLegalActions(gameState: GameState, playerId?: string): LegalActionsResponse {
    const currentPlayer = this.getCurrentPlayer(gameState, playerId);
    
    if (!currentPlayer) {
      throw new Error('Invalid player or game state');
    }

    const legalActions = this.calculateLegalActions(gameState, currentPlayer);

    return {
      gameId: gameState.gameId,
      playerId: currentPlayer.id,
      legalActions,
      gameState: {
        currentBet: gameState.currentBet,
        playerChips: currentPlayer.chips,
        potSize: gameState.pot,
        minRaise: gameState.minRaise || gameState.bigBlind * 2,
      },
    };
  }

  private getCurrentPlayer(gameState: GameState, playerId?: string): Player | null {
    if (playerId) {
      return gameState.players.find(player => player.id === playerId) || null;
    }
    
    // If no playerId provided, use the current player based on game state
    if (gameState.currentPlayerIndex >= 0 && gameState.currentPlayerIndex < gameState.players.length) {
      return gameState.players[gameState.currentPlayerIndex];
    }
    
    return null;
  }

  private calculateLegalActions(gameState: GameState, player: Player): PokerAction[] {
    const actions: PokerAction[] = [];

    // If player is all-in or folded, no actions available
    if (player.isAllIn || player.isFolded) {
      return actions;
    }

    const callAmount = Math.max(0, gameState.currentBet - player.currentBet);
    const playerChips = player.chips;

    // Player can always fold (unless already folded or all-in)
    if (playerChips > 0) {
      actions.push({
        type: 'fold',
        isValid: true,
        description: 'Fold your hand',
      });
    }

    // Check if player can check (no bet to call)
    if (callAmount === 0) {
      actions.push({
        type: 'check',
        isValid: true,
        description: 'Check (no bet to call)',
      });
    } else {
      // Player needs to call
      if (playerChips >= callAmount) {
        actions.push({
          type: 'call',
          amount: callAmount,
          isValid: true,
          description: `Call ${callAmount} chips`,
        });
      }
    }

    // Calculate raise/bet options
    const availableForBet = playerChips - callAmount;
    
    if (gameState.currentBet === 0) {
      // No current bet, so this would be a bet
      if (availableForBet >= gameState.bigBlind) {
        actions.push({
          type: 'bet',
          amount: gameState.bigBlind,
          isValid: true,
          description: `Bet ${gameState.bigBlind} chips (minimum)`,
        });
      }
    } else {
      // There's a current bet, so this would be a raise
      const minRaiseAmount = gameState.currentBet; // Standard min raise = current bet
      if (availableForBet >= minRaiseAmount) {
        actions.push({
          type: 'raise',
          amount: gameState.currentBet * 2, // Default to 2x current bet
          isValid: true,
          description: `Raise to ${gameState.currentBet * 2} chips`,
        });
      }
    }

    // All-in is always an option if player has chips
    if (playerChips > 0) {
      actions.push({
        type: 'all-in',
        amount: playerChips,
        isValid: true,
        description: `All-in for ${playerChips} chips`,
      });
    }

    return actions;
  }
}

export const pokerService = new PokerService();