
import { useEffect } from 'react';
import { GameState } from '@/utils/gameState';
import { getAvailableActions } from '@/utils/shareHandActions';
import { standardizePosition } from '@/utils/positionMapping';

export interface GameStateUIUpdates {
  currentPlayerPosition: string;
  availableActions: string[];
  potAmount: number;
  currentRound: string;
  isPlayerActive: (position: string) => boolean;
  isRoundActive: (round: string) => boolean;
  isActionAvailable: (action: string) => boolean;
}

export const useGameStateUI = (gameState: GameState | null): GameStateUIUpdates => {
  const currentPlayerPosition = gameState?.currentPosition || '';
  const potAmount = gameState?.pot || 0;
  const currentRound = gameState?.round || 'preflop';
  
  // Get available actions for current player
  const availableActions = gameState ? 
    getAvailableActions(currentRound + 'Actions', 0, []) : [];

  const isPlayerActive = (position: string): boolean => {
    if (!gameState || !position) return false;
    return standardizePosition(position) === standardizePosition(currentPlayerPosition);
  };

  const isRoundActive = (round: string): boolean => {
    return round === currentRound;
  };

  const isActionAvailable = (action: string): boolean => {
    return availableActions.includes(action);
  };

  // Log state changes for debugging
  useEffect(() => {
    if (gameState) {
      console.log('Game State UI Update:', {
        currentPlayer: currentPlayerPosition,
        availableActions,
        pot: potAmount,
        round: currentRound
      });
    }
  }, [gameState, currentPlayerPosition, availableActions, potAmount, currentRound]);

  return {
    currentPlayerPosition,
    availableActions,
    potAmount,
    currentRound,
    isPlayerActive,
    isRoundActive,
    isActionAvailable
  };
};
