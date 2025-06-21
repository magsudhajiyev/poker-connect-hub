// Poker-specific API service for game validation and actions

import { apiService } from './api';
import { 
  UnifiedGameState, 
  LegalActionsResponse, 
  ValidationResult, 
  ApiResponse,
  UnifiedPlayer, 
} from '@/types/unified';
import { convertToBackendGameState, convertFromBackendResponse } from './converters';

export interface GetLegalActionsRequest {
  gameState: UnifiedGameState;
  playerId?: string;
}

export interface ValidateGameStateRequest {
  gameState: UnifiedGameState;
}

export class PokerApiService {
  private readonly ENDPOINTS = {
    LEGAL_ACTIONS: '/api/poker/actions',
    NEXT_STATE: '/api/poker/next-state',
    VALIDATE_STATE: '/api/poker/validate-state',
  };

  /**
   * Get legal actions for a player in the current game state
   */
  async getLegalActions(
    gameState: UnifiedGameState,
    playerId?: string,
  ): Promise<ApiResponse<LegalActionsResponse>> {
    try {
      // Convert unified game state to backend format
      const backendGameState = convertToBackendGameState(gameState);
      
      const request: GetLegalActionsRequest = {
        gameState: backendGameState,
        playerId,
      };

      const response = await apiService.post<any>(
        this.ENDPOINTS.LEGAL_ACTIONS,
        request,
      );

      if (response.success && response.data) {
        // Convert backend response to unified format
        const convertedData = convertFromBackendResponse(response.data);
        return {
          success: true,
          data: convertedData as LegalActionsResponse,
        };
      }

      return response as ApiResponse<LegalActionsResponse>;
    } catch (error) {
      console.error('Error getting legal actions:', error);
      return {
        success: false,
        error: {
          message: 'Failed to get legal actions',
          details: error,
        },
      };
    }
  }

  /**
   * Validate a game state
   */
  async validateGameState(
    gameState: UnifiedGameState,
  ): Promise<ApiResponse<ValidationResult>> {
    try {
      const backendGameState = convertToBackendGameState(gameState);
      
      const request: ValidateGameStateRequest = {
        gameState: backendGameState,
      };

      // For now, we'll use the legal actions endpoint for validation
      // since the backend doesn't have a separate validation endpoint
      const response = await apiService.post<any>(
        this.ENDPOINTS.LEGAL_ACTIONS,
        request,
      );

      if (response.success) {
        return {
          success: true,
          data: {
            isValid: true,
            message: 'Game state is valid',
          },
        };
      } else {
        return {
          success: true,
          data: {
            isValid: false,
            message: response.error?.message || 'Invalid game state',
            errors: response.error?.details ? [response.error.details] : undefined,
          },
        };
      }
    } catch (error) {
      console.error('Error validating game state:', error);
      return {
        success: false,
        error: {
          message: 'Failed to validate game state',
          details: error,
        },
      };
    }
  }

  /**
   * Get next game state (for AI-driven game progression)
   */
  async getNextGameState(
    gameState: UnifiedGameState,
  ): Promise<ApiResponse<UnifiedGameState>> {
    try {
      const backendGameState = convertToBackendGameState(gameState);
      
      const response = await apiService.post<any>(
        this.ENDPOINTS.NEXT_STATE,
        { gameState: backendGameState },
      );

      if (response.success && response.data) {
        // Convert backend response back to unified format
        const convertedData = convertFromBackendResponse(response.data);
        return {
          success: true,
          data: convertedData as UnifiedGameState,
        };
      }

      return response as ApiResponse<UnifiedGameState>;
    } catch (error) {
      console.error('Error getting next game state:', error);
      return {
        success: false,
        error: {
          message: 'Failed to get next game state',
          details: error,
        },
      };
    }
  }

  /**
   * Helper method to check if a player action is valid
   */
  async isActionValid(
    gameState: UnifiedGameState,
    playerId: string,
    action: string,
    amount?: number,
  ): Promise<ApiResponse<boolean>> {
    const legalActionsResponse = await this.getLegalActions(gameState, playerId);
    
    if (!legalActionsResponse.success || !legalActionsResponse.data) {
      return {
        success: false,
        error: {
          message: 'Failed to get legal actions for validation',
          details: legalActionsResponse.error,
        },
      };
    }

    const legalActions = legalActionsResponse.data.legalActions;
    const isValid = legalActions.some(legalAction => {
      if (legalAction.type !== action) {
return false;
}
      if (amount !== undefined && legalAction.amount !== amount) {
return false;
}
      return true;
    });

    return {
      success: true,
      data: isValid,
    };
  }

  /**
   * Create a game state from player setup data
   */
  createGameStateFromPlayers(
    players: UnifiedPlayer[],
    smallBlind: number,
    bigBlind: number,
    gameId: string = `game_${Date.now()}`,
  ): UnifiedGameState {
    // Find dealer position (default to position 0)
    const dealerPosition = 0;
    
    return {
      gameId,
      players: players.map((player, index) => ({
        ...player,
        currentBet: 0,
        isActive: true,
        hasActed: false,
        isFolded: false,
        isAllIn: false,
        holeCards: player.holeCards || [],
        positionIndex: index,
      })),
      communityCards: [],
      pot: 0,
      currentBet: 0,
      minRaise: bigBlind,
      bigBlind,
      smallBlind,
      currentPlayerIndex: 0,
      dealerPosition,
      gamePhase: 'preflop',
      bettingRound: 1,
    };
  }
}

// Create singleton instance
export const pokerApiService = new PokerApiService();