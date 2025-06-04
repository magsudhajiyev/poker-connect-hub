
import { useEffect, useState } from 'react';
import { GameState } from '@/utils/gameState';
import { getAvailableActions } from '@/utils/shareHandActions';
import { standardizePosition, getActionOrder } from '@/utils/positionMapping';
import { Player } from '@/types/shareHand';

export interface GameStateUIUpdates {
  currentPlayerPosition: string;
  availableActions: string[];
  potAmount: number;
  currentRound: string;
  gameState: GameState | null;
  isPlayerActive: (position: string) => boolean;
  isRoundActive: (round: string) => boolean;
  isActionAvailable: (action: string) => boolean;
  initializeGame: (players: Player[], smallBlind: number, bigBlind: number) => GameState;
  updateGameState: (newState: GameState) => void;
}

export const useGameStateUI = (initialGameState?: GameState | null): GameStateUIUpdates => {
  const [gameState, setGameState] = useState<GameState | null>(initialGameState || null);
  
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

  const updateGameState = (newState: GameState) => {
    console.log('Updating game state:', newState);
    setGameState(newState);
  };

  const initializeGame = (players: Player[], smallBlind: number, bigBlind: number): GameState => {
    // Convert UI players to game state format
    const activePlayers = players.map(player => ({
      name: player.name,
      position: player.position,
      stack: player.stackSize[0] || 100,
      isHero: player.isHero
    }));

    // Find small blind and big blind players
    const sbPlayer = activePlayers.find(p => standardizePosition(p.position) === 'SB');
    const bbPlayer = activePlayers.find(p => standardizePosition(p.position) === 'BB');
    
    // Initialize action history with blinds
    const actionHistory = [];
    
    if (sbPlayer) {
      actionHistory.push({
        round: 'preflop' as const,
        player: sbPlayer.name,
        action: 'post',
        amount: smallBlind
      });
    }
    
    if (bbPlayer) {
      actionHistory.push({
        round: 'preflop' as const,
        player: bbPlayer.name,
        action: 'post',
        amount: bigBlind
      });
    }

    // Get first player to act preflop (first position after BB)
    const uiPositions = players.map(p => p.position);
    const orderedPositions = getActionOrder(uiPositions, true); // true for preflop
    let firstToAct = orderedPositions[0];
    
    // Find the player with this position
    const firstPlayer = activePlayers.find(p => 
      standardizePosition(p.position) === firstToAct
    );

    const newGameState: GameState = {
      round: 'preflop',
      activePlayers,
      currentPosition: firstPlayer?.position || activePlayers[0].position,
      currentBet: bigBlind,
      lastAggressor: bbPlayer?.name || '',
      pot: smallBlind + bigBlind,
      actionHistory
    };

    console.log('Game initialized:', newGameState);
    setGameState(newGameState);
    return newGameState;
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
    gameState,
    isPlayerActive,
    isRoundActive,
    isActionAvailable,
    initializeGame,
    updateGameState
  };
};
