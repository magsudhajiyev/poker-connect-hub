
import { useEffect, useState, useCallback, useMemo } from 'react';
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
  
  // Memoize basic state values to prevent unnecessary recalculations
  const currentPlayerPosition = useMemo(() => gameState?.currentPosition || '', [gameState?.currentPosition]);
  const potAmount = useMemo(() => gameState?.pot || 0, [gameState?.pot]);
  const currentRound = useMemo(() => gameState?.round || 'preflop', [gameState?.round]);
  
  // Memoize available actions calculation
  const availableActions = useMemo(() => {
    return gameState ? getAvailableActions(`${currentRound}Actions`, 0, []) : [];
  }, [gameState, currentRound]);

  const isPlayerActive = useCallback((position: string): boolean => {
    if (!gameState || !position) {
      return false;
    }
    
    // Check if this is the current player to act
    const isCurrentPlayer = standardizePosition(position) === standardizePosition(currentPlayerPosition);
    
    // Check if player is still active in the hand
    const player = gameState.activePlayers.find(p => standardizePosition(p.position) === standardizePosition(position));
    const isStillInHand = player?.isActive !== false;
    
    return isCurrentPlayer && isStillInHand;
  }, [gameState, currentPlayerPosition]);

  const isRoundActive = useCallback((round: string): boolean => {
    return round === currentRound;
  }, [currentRound]);

  const isActionAvailable = useCallback((action: string): boolean => {
    return availableActions.includes(action);
  }, [availableActions]);

  const updateGameState = useCallback((newState: GameState) => {
    setGameState(newState);
  }, []);

  const initializeGame = useCallback((players: Player[], smallBlind: number, bigBlind: number): GameState => {
    // Create action order based on positions
    const positionOrder = ['sb', 'bb', 'utg', 'utg1', 'mp', 'lj', 'hj', 'co', 'btn'];
    const playerPositions = players.map(p => p.position);
    
    // Preflop action order: start after BB
    const actionOrder = [];
    for (const pos of positionOrder) {
      if (playerPositions.includes(pos) && pos !== 'sb' && pos !== 'bb') {
        actionOrder.push(pos);
      }
    }
    // Add blinds at the end for preflop
    if (playerPositions.includes('sb')) {
actionOrder.push('sb');
}
    if (playerPositions.includes('bb')) {
actionOrder.push('bb');
}

    // Convert UI players to game state format
    const activePlayers = players.map(player => ({
      name: player.name,
      position: player.position,
      stack: player.stackSize[0] || 100,
      isHero: player.isHero,
      hasActedAfterRaise: false,
      isActive: true,
    }));

    // Find small blind and big blind players
    const sbPlayer = activePlayers.find(p => standardizePosition(p.position) === 'SB');
    const bbPlayer = activePlayers.find(p => standardizePosition(p.position) === 'BB');
    
    // Initialize action history with blinds
    const actionHistory = [];
    
    if (sbPlayer) {
      actionHistory.push({
        round: 'preflop' as const,
        player: sbPlayer.position,
        action: 'post',
        amount: smallBlind,
      });
    }
    
    if (bbPlayer) {
      actionHistory.push({
        round: 'preflop' as const,
        player: bbPlayer.position,
        action: 'post',
        amount: bigBlind,
      });
    }

    // Set first to act (first in action order)
    const firstToAct = actionOrder[0] || players[0].position;

    const newGameState: GameState = {
      round: 'preflop',
      activePlayers,
      currentPosition: firstToAct,
      currentBet: bigBlind,
      lastAggressor: bbPlayer?.position || '',
      pot: smallBlind + bigBlind,
      actionHistory,
      actionOrder,
    };

    setGameState(newGameState);
    return newGameState;
  }, []);

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
    updateGameState,
  };
};
