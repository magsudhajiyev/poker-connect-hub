// New hook that integrates with backend API for poker game logic validation

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  UnifiedPlayer, 
  UnifiedGameState, 
  PokerAction, 
  LegalActionsResponse, 
} from '@/types/unified';
import { pokerApiService } from '@/services';
import { frontendPlayerToUnified } from '@/services/converters';
import { Player as LegacyPlayer } from '@/types/shareHand';
import { useErrorHandler } from '@/components/error-boundary';

interface UsePokerApiEngineProps {
  players: LegacyPlayer[] | UnifiedPlayer[];
  smallBlind: string | number;
  bigBlind: string | number;
  currentStreet: string;
}

interface UsePokerApiEngineReturn {
  gameState: UnifiedGameState | null;
  currentPlayerToAct: string | null;
  potAmount: number;
  availableActions: PokerAction[];
  isLoading: boolean;
  error: string | null;
  executeAction: (actionType: string, amount?: number) => Promise<boolean>;
  getValidActionsForPlayer: (playerId: string) => Promise<PokerAction[]>;
  isPlayerToAct: (playerId: string) => boolean;
  getCurrentPot: () => number;
  refreshGameState: () => Promise<void>;
  validateAction: (playerId: string, action: string, amount?: number) => Promise<boolean>;
}

export const usePokerApiEngine = ({
  players,
  smallBlind,
  bigBlind,
  currentStreet,
}: UsePokerApiEngineProps): UsePokerApiEngineReturn => {
  const [gameState, setGameState] = useState<UnifiedGameState | null>(null);
  const [currentPlayerToAct, setCurrentPlayerToAct] = useState<string | null>(null);
  const [potAmount, setPotAmount] = useState<number>(0);
  const [availableActions, setAvailableActions] = useState<PokerAction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const initializedRef = useRef<boolean>(false);
  const gameStateRef = useRef<UnifiedGameState | null>(null);
  const { handleError } = useErrorHandler();

  // Convert legacy players to unified format
  const convertPlayers = useCallback((inputPlayers: LegacyPlayer[] | UnifiedPlayer[]): UnifiedPlayer[] => {
    if (!inputPlayers.length) {
return [];
}
    
    // Check if already unified
    if ('chips' in inputPlayers[0]) {
      return inputPlayers as UnifiedPlayer[];
    }
    
    // Convert from legacy format
    return (inputPlayers as LegacyPlayer[]).map(frontendPlayerToUnified);
  }, []);

  // Initialize game state
  const initializeGame = useCallback(async () => {
    if (!players || players.length < 2) {
return;
}
    
    const sb = typeof smallBlind === 'string' ? parseFloat(smallBlind) : smallBlind;
    const bb = typeof bigBlind === 'string' ? parseFloat(bigBlind) : bigBlind;
    
    if (isNaN(sb) || isNaN(bb) || sb <= 0 || bb <= 0) {
      setError('Invalid blind values');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const unifiedPlayers = convertPlayers(players);
      const newGameState = pokerApiService.createGameStateFromPlayers(
        unifiedPlayers,
        sb,
        bb,
      );

      // Post blinds
      const sbPlayerIndex = unifiedPlayers.findIndex(p => 
        p.position.toLowerCase().includes('sb') || p.position.toLowerCase() === 'small blind',
      );
      const bbPlayerIndex = unifiedPlayers.findIndex(p => 
        p.position.toLowerCase().includes('bb') || p.position.toLowerCase() === 'big blind',
      );

      if (sbPlayerIndex >= 0 && bbPlayerIndex >= 0) {
        newGameState.players[sbPlayerIndex].currentBet = sb;
        newGameState.players[sbPlayerIndex].chips -= sb;
        newGameState.players[bbPlayerIndex].currentBet = bb;
        newGameState.players[bbPlayerIndex].chips -= bb;
        newGameState.pot = sb + bb;
        newGameState.currentBet = bb;
      }

      setGameState(newGameState);
      gameStateRef.current = newGameState;
      setPotAmount(newGameState.pot);

      // Get initial legal actions
      // Only refresh legal actions if we're in an action step (not positions step)
      if (currentStreet && currentStreet !== 'positions') {
        await refreshLegalActions(newGameState);
      }
      
      initializedRef.current = true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize game';
      setError(errorMessage);
      handleError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [players, smallBlind, bigBlind, convertPlayers, handleError]);

  // Refresh legal actions for current player
  const refreshLegalActions = useCallback(async (currentGameState?: UnifiedGameState) => {
    const state = currentGameState || gameStateRef.current;
    if (!state) {
return;
}

    try {
      const currentPlayerIndex = state.currentPlayerIndex;
      if (currentPlayerIndex < 0 || currentPlayerIndex >= state.players.length) {
        setAvailableActions([]);
        setCurrentPlayerToAct(null);
        return;
      }

      const currentPlayer = state.players[currentPlayerIndex];
      const response = await pokerApiService.getLegalActions(state, currentPlayer.id);

      if (response.success && response.data) {
        setAvailableActions(response.data.legalActions);
        setCurrentPlayerToAct(currentPlayer.id);
      } else {
        setError(response.error?.message || 'Failed to get legal actions');
        setAvailableActions([]);
        setCurrentPlayerToAct(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh legal actions';
      setError(errorMessage);
      setAvailableActions([]);
      setCurrentPlayerToAct(null);
    }
  }, []);

  // Execute an action
  const executeAction = useCallback(async (actionType: string, amount?: number): Promise<boolean> => {
    if (!gameStateRef.current || !currentPlayerToAct) {
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Validate action with backend first
      const isValid = await validateAction(currentPlayerToAct, actionType, amount);
      if (!isValid) {
        setError('Invalid action');
        return false;
      }

      // Update local game state (simplified logic)
      const updatedGameState = { ...gameStateRef.current };
      const playerIndex = updatedGameState.players.findIndex(p => p.id === currentPlayerToAct);
      
      if (playerIndex === -1) {
return false;
}

      const player = updatedGameState.players[playerIndex];

      // Apply action to game state
      switch (actionType.toLowerCase()) {
        case 'fold':
          player.isFolded = true;
          break;
        case 'call':
          const callAmount = Math.min(
            updatedGameState.currentBet - (player.currentBet || 0),
            player.chips,
          );
          player.currentBet = (player.currentBet || 0) + callAmount;
          player.chips -= callAmount;
          updatedGameState.pot += callAmount;
          break;
        case 'raise':
        case 'bet':
          if (amount && amount > 0) {
            const totalBet = Math.min(amount, player.chips);
            updatedGameState.pot += totalBet;
            player.chips -= totalBet;
            player.currentBet = (player.currentBet || 0) + totalBet;
            updatedGameState.currentBet = Math.max(updatedGameState.currentBet, player.currentBet);
          }
          break;
        case 'check':
          // No state change needed for check
          break;
        case 'all-in':
          const allInAmount = player.chips;
          updatedGameState.pot += allInAmount;
          player.currentBet = (player.currentBet || 0) + allInAmount;
          player.chips = 0;
          player.isAllIn = true;
          if (player.currentBet > updatedGameState.currentBet) {
            updatedGameState.currentBet = player.currentBet;
          }
          break;
      }

      player.hasActed = true;

      // Move to next player (simplified logic)
      const activePlayers = updatedGameState.players.filter(p => !p.isFolded && !p.isAllIn);
      if (activePlayers.length > 1) {
        updatedGameState.currentPlayerIndex = (playerIndex + 1) % updatedGameState.players.length;
        while (
          updatedGameState.players[updatedGameState.currentPlayerIndex].isFolded ||
          updatedGameState.players[updatedGameState.currentPlayerIndex].isAllIn
        ) {
          updatedGameState.currentPlayerIndex = 
            (updatedGameState.currentPlayerIndex + 1) % updatedGameState.players.length;
        }
      }

      setGameState(updatedGameState);
      gameStateRef.current = updatedGameState;
      setPotAmount(updatedGameState.pot);

      // Refresh legal actions for next player
      await refreshLegalActions(updatedGameState);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute action';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentPlayerToAct, refreshLegalActions]);

  // Get valid actions for a specific player
  const getValidActionsForPlayer = useCallback(async (playerId: string): Promise<PokerAction[]> => {
    if (!gameStateRef.current) {
return [];
}

    try {
      const response = await pokerApiService.getLegalActions(gameStateRef.current, playerId);
      return response.success && response.data ? response.data.legalActions : [];
    } catch (err) {
      console.error('Failed to get valid actions for player:', err);
      return [];
    }
  }, []);

  // Check if a player is the current player to act
  const isPlayerToAct = useCallback((playerId: string): boolean => {
    return currentPlayerToAct === playerId;
  }, [currentPlayerToAct]);

  // Get current pot amount
  const getCurrentPot = useCallback((): number => {
    return gameStateRef.current?.pot || potAmount;
  }, [potAmount]);

  // Refresh the entire game state
  const refreshGameState = useCallback(async () => {
    if (gameStateRef.current) {
      await refreshLegalActions();
    }
  }, [refreshLegalActions]);

  // Validate a specific action
  const validateAction = useCallback(async (
    playerId: string, 
    action: string, 
    amount?: number,
  ): Promise<boolean> => {
    if (!gameStateRef.current) {
return false;
}

    try {
      const response = await pokerApiService.isActionValid(
        gameStateRef.current,
        playerId,
        action,
        amount,
      );
      return response.success && response.data === true;
    } catch (err) {
      console.error('Failed to validate action:', err);
      return false;
    }
  }, []);

  // Initialize game when dependencies change
  useEffect(() => {
    // Skip initialization if players don't have positions assigned yet
    const allPlayersHavePositions = players?.every(p => p.position && p.position.trim() !== '');
    
    if (!initializedRef.current && players && players.length >= 2 && smallBlind && bigBlind && allPlayersHavePositions) {
      // Debounce initialization to prevent rapid calls
      const timeoutId = setTimeout(() => {
        if (!initializedRef.current) {
          initializeGame();
        }
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
    
    // Reset when players change
    if (!players || players.length < 2 || !allPlayersHavePositions) {
      initializedRef.current = false;
      setGameState(null);
      gameStateRef.current = null;
    }
  }, [players?.length, smallBlind, bigBlind, players?.map(p => p.position).join(','), initializeGame]);

  // Handle street changes
  useEffect(() => {
    if (gameStateRef.current && currentStreet) {
      const streetMapping: { [key: string]: UnifiedGameState['gamePhase'] } = {
        'preflopActions': 'preflop',
        'flopActions': 'flop',
        'turnActions': 'turn',
        'riverActions': 'river',
      };
      
      const gamePhase = streetMapping[currentStreet] || 'preflop';
      
      if (gameStateRef.current.gamePhase !== gamePhase) {
        const updatedGameState = {
          ...gameStateRef.current,
          gamePhase,
          bettingRound: gameStateRef.current.bettingRound + 1,
        };
        
        // Reset betting for new street
        updatedGameState.players.forEach(player => {
          if (!player.isFolded) {
            player.currentBet = 0;
            player.hasActed = false;
          }
        });
        updatedGameState.currentBet = 0;
        
        setGameState(updatedGameState);
        gameStateRef.current = updatedGameState;
        refreshLegalActions(updatedGameState);
      }
    }
  }, [currentStreet, refreshLegalActions]);

  return {
    gameState,
    currentPlayerToAct,
    potAmount,
    availableActions,
    isLoading,
    error,
    executeAction,
    getValidActionsForPlayer,
    isPlayerToAct,
    getCurrentPot,
    refreshGameState,
    validateAction,
  };
};