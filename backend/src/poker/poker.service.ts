import { Injectable } from '@nestjs/common';
import { GameState, PokerAction, LegalActionsResponse, Player } from './interfaces/poker.interfaces';

@Injectable()
export class PokerService {
  
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
        minRaise: gameState.minRaise,
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

    // Player can always fold (unless already folded or all-in)
    if (!player.isFolded && !player.isAllIn) {
      actions.push({
        type: 'fold',
        isValid: true,
        description: 'Fold your hand',
      });
    }

    // If player is all-in or folded, no other actions available
    if (player.isAllIn || player.isFolded) {
      return actions;
    }

    const callAmount = gameState.currentBet - player.currentBet;
    const playerChips = player.chips;

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
    const minRaiseAmount = gameState.currentBet === 0 ? gameState.bigBlind : gameState.currentBet + gameState.minRaise;
    const maxRaiseAmount = player.currentBet + playerChips;

    if (gameState.currentBet === 0) {
      // No current bet, so this would be a bet
      if (playerChips >= gameState.bigBlind) {
        actions.push({
          type: 'bet',
          amount: gameState.bigBlind,
          isValid: true,
          description: `Bet ${gameState.bigBlind} chips (minimum)`,
        });
      }
    } else {
      // There's a current bet, so this would be a raise
      if (playerChips >= minRaiseAmount - player.currentBet) {
        const raiseAmount = minRaiseAmount;
        actions.push({
          type: 'raise',
          amount: raiseAmount,
          isValid: true,
          description: `Raise to ${raiseAmount} chips (minimum raise)`,
        });
      }
    }

    // All-in option (if player has chips and it's meaningful)
    if (playerChips > 0) {
      const allInAmount = player.currentBet + playerChips;
      actions.push({
        type: 'all-in',
        amount: allInAmount,
        isValid: true,
        description: `All-in for ${allInAmount} chips`,
      });
    }

    return actions;
  }

  /**
   * Validate if a game state is properly formatted
   */
  validateGameState(gameState: GameState): boolean {
    try {
      // Basic validation checks
      if (!gameState.gameId || !gameState.players || gameState.players.length === 0) {
        return false;
      }

      if (gameState.currentPlayerIndex < 0 || gameState.currentPlayerIndex >= gameState.players.length) {
        return false;
      }

      // Validate players
      for (const player of gameState.players) {
        if (!player.id || player.chips < 0 || player.currentBet < 0) {
          return false;
        }
      }

      return true;
    } catch (error) {
      return false;
    }
  }
}
