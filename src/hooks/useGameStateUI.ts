
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
    
    // Check if this is the current player to act
    const isCurrentPlayer = standardizePosition(position) === standardizePosition(currentPlayerPosition);
    
    // Check if player is still active in the hand
    const player = gameState.activePlayers.find(p => standardizePosition(p.position) === standardizePosition(position));
    const isStillInHand = player?.isActive !== false;
    
    return isCurrentPlayer && isStillInHand;
  };

  const isRoundActive = (round: string): boolean => {
    return round === currentRound;
  };

  const isActionAvailable = (action: string): boolean => {
    return availableActions.includes(action);
  };

  const updateGameState = (newState: GameState) => {
    console.log('Updating game state:', {
      round: newState.round,
      currentPlayer: newState.currentPosition,
      activePlayers: newState.activePlayers.filter(p => p.isActive).map(p => p.position),
      pot: newState.pot,
      currentBet: newState.currentBet
    });
    setGameState(newState);
  };

  const initializeGame = (players: Player[], smallBlind: number, bigBlind: number): GameState => {
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
    if (playerPositions.includes('sb')) actionOrder.push('sb');
    if (playerPositions.includes('bb')) actionOrder.push('bb');

    // Convert UI players to game state format
    const activePlayers = players.map(player => ({
      name: player.name,
      position: player.position,
      stack: player.stackSize[0] || 100,
      isHero: player.isHero,
      hasActedAfterRaise: false,
      isActive: true
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
        amount: smallBlind
      });
    }
    
    if (bbPlayer) {
      actionHistory.push({
        round: 'preflop' as const,
        player: bbPlayer.position,
        action: 'post',
        amount: bigBlind
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
      actionOrder
    };

    console.log('Game initialized with improved multi-player logic:', {
      players: newGameState.activePlayers.map(p => ({ name: p.name, position: p.position })),
      actionOrder: newGameState.actionOrder,
      firstToAct: newGameState.currentPosition,
      pot: newGameState.pot
    });
    
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
        round: currentRound,
        activePlayers: gameState.activePlayers.filter(p => p.isActive).map(p => p.position)
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
