// This hook maintains the existing local poker engine logic
// For new features, consider using usePokerApiEngine for backend integration

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { PokerGameEngine } from '@/utils/PokerGameEngine';
import { Player } from '@/types/shareHand';
import { Position } from '@/constants';

interface UsePokerGameEngineProps {
  players: Player[];
  smallBlind: string;
  bigBlind: string;
  currentStreet: string;
}

// Legacy hook - prefer usePokerApiEngine for new implementations
export const usePokerGameEngine = ({
  players,
  smallBlind,
  bigBlind,
  currentStreet,
}: UsePokerGameEngineProps) => {
  const [, setEngine] = useState<PokerGameEngine | null>(null);
  const [currentPlayerToAct, setCurrentPlayerToAct] = useState<string | null>(null);
  const [potAmount, setPotAmount] = useState<number>(0);
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const engineRef = useRef<PokerGameEngine | null>(null);
  const initializedRef = useRef<boolean>(false);
  const lastUpdateRef = useRef<number>(0); // Track last update to prevent race conditions

  // Memoize parsed blinds to prevent unnecessary recalculations
  const parsedBlinds = useMemo(
    () => ({
      sb: parseFloat(smallBlind),
      bb: parseFloat(bigBlind),
    }),
    [smallBlind, bigBlind],
  );

  // Initialize engine when players and blinds are available
  useEffect(() => {
    if (players && players.length >= 2 && smallBlind && bigBlind && !initializedRef.current) {
      const { sb, bb } = parsedBlinds;

      if (!isNaN(sb) && !isNaN(bb) && sb > 0 && bb > 0) {
        setIsInitializing(true);
        setError(null);

        try {
          // Validate players have required properties
          const invalidPlayers = players.filter((p) => !p.id || !p.position || !p.name);
          if (invalidPlayers.length > 0) {
            throw new Error(
              `Invalid player data: ${invalidPlayers.length} players missing required fields`,
            );
          }

          // Convert Player[] to PokerPlayer[]
          const pokerPlayers = players.map((p) => ({
            id: p.id,
            name: p.name,
            stack: p.stackSize[0],
            hand: [],
            bet: 0,
            folded: false,
            allIn: false,
            position: p.position as Position,
          }));

          // Initialize poker engine with converted players
          const newEngine = new PokerGameEngine(pokerPlayers, sb, bb);

          // Find SB and BB positions
          const sbPlayer = players.find(
            (p) => p.position === 'sb' || p.position === Position.SMALL_BLIND,
          );
          const bbPlayer = players.find(
            (p) => p.position === 'bb' || p.position === Position.BIG_BLIND,
          );

          // Validate SB/BB positions exist
          if (!sbPlayer || !bbPlayer) {
            throw new Error('Small blind and big blind positions are required');
          }

          const sbIndex = players.indexOf(sbPlayer);
          const bbIndex = players.indexOf(bbPlayer);

          if (sbIndex === -1 || bbIndex === -1) {
            throw new Error('Could not find small blind or big blind player indexes');
          }

          // Post blinds for SB and BB players
          newEngine.postBlinds(sbIndex, bbIndex);

          // Start preflop betting with proper position ordering
          newEngine.startBettingRound();

          setEngine(newEngine);
          engineRef.current = newEngine;
          initializedRef.current = true;

          // Get initial state
          const currentPlayer = newEngine.getCurrentPlayer();
          const legalActions = newEngine.getLegalActions();

          if (currentPlayer) {
            setCurrentPlayerToAct(String(currentPlayer.id));
            setAvailableActions(legalActions);
          } else {
            setCurrentPlayerToAct(null);
            setAvailableActions([]);
          }

          setPotAmount(newEngine.pot);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to initialize poker engine';
          console.error('Error initializing poker engine:', error);
          setError(errorMessage);
          toast({
            title: 'Engine Error',
            description: errorMessage,
            variant: 'destructive',
          });
        } finally {
          setIsInitializing(false);
        }
      } else {
        setError('Invalid blind amounts');
      }
    }

    // Reset when players change significantly
    if (!players || players.length < 2) {
      initializedRef.current = false;
      setError(null);
    }
  }, [players?.length, parsedBlinds.sb, parsedBlinds.bb]);

  // Update street when it changes
  useEffect(() => {
    if (engineRef.current && currentStreet && initializedRef.current) {
      const streetMapping: { [key: string]: string } = {
        preflopActions: 'preflop',
        flopActions: 'flop',
        turnActions: 'turn',
        riverActions: 'river',
      };

      const engineStreet = streetMapping[currentStreet] || 'preflop';

      if (engineRef.current.street !== engineStreet) {
        // Create a method to safely update street instead of direct mutation
        const updateStreetSafely = (newStreet: string) => {
          if (!engineRef.current) {
            return;
          }

          // Update street property
          engineRef.current.street = newStreet;

          // Reset betting for new street (this is acceptable as it's internal engine state)
          engineRef.current.players.forEach((p) => {
            if (!p.folded) {
              p.bet = 0;
            }
          });
          engineRef.current.currentBet = 0;

          // Start new betting round with proper position ordering
          engineRef.current.startBettingRound();
        };

        updateStreetSafely(engineStreet);

        // Update React state
        setEngine(engineRef.current);

        const currentPlayer = engineRef.current.getCurrentPlayer();
        const legalActions = engineRef.current.getLegalActions();

        if (currentPlayer) {
          setCurrentPlayerToAct(String(currentPlayer.id));
          setAvailableActions(legalActions);
        } else {
          setCurrentPlayerToAct(null);
          setAvailableActions([]);
        }

        setPotAmount(engineRef.current.pot);
      }
    }
  }, [currentStreet]);

  const executeAction = useCallback((actionType: string, amount?: number): boolean => {
    try {
      if (!engineRef.current) {
        setError('Game engine not initialized');
        return false;
      }

      setError(null); // Clear any previous errors

      // Prevent race conditions by using a timestamp
      const updateId = Date.now();
      lastUpdateRef.current = updateId;

      // Execute poker action
      const success = engineRef.current.takeAction(actionType, amount || 0);

      if (success) {
        // Only proceed if this is still the latest update
        if (lastUpdateRef.current !== updateId) {
          return true;
        }

        const currentPlayer = engineRef.current.getCurrentPlayer();
        const legalActions = engineRef.current.getLegalActions();

        // Update state immediately - no artificial delays needed
        const newPotAmount = engineRef.current.pot;

        // Batch state updates to prevent multiple renders
        setPotAmount(newPotAmount);

        if (currentPlayer) {
          setCurrentPlayerToAct(String(currentPlayer.id));
          setAvailableActions(legalActions);
        } else {
          setCurrentPlayerToAct(null);
          setAvailableActions([]);
        }

        // Force component re-render
        setForceUpdate((prev) => prev + 1);

        return true;
      } else {
        const errorMessage = `Invalid action: ${actionType}${amount ? ` with amount ${amount}` : ''}`;
        setError(errorMessage);
        toast({
          title: 'Invalid Action',
          description: errorMessage,
          variant: 'destructive',
        });
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to execute action';
      console.error('Error executing action:', error);
      setError(errorMessage);
      toast({
        title: 'Action Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  const getValidActionsForPlayer = useCallback((playerId: string): string[] => {
    if (!engineRef.current) {
      return [];
    }

    const currentPlayer = engineRef.current.getCurrentPlayer();

    if (currentPlayer && String(currentPlayer.id) === playerId) {
      const actions = engineRef.current.getLegalActions();
      return actions;
    }

    return [];
  }, []);

  const isPlayerToAct = useCallback(
    (playerId: string): boolean => {
      return currentPlayerToAct === playerId;
    },
    [currentPlayerToAct],
  );

  const getCurrentPot = useCallback((): number => {
    return engineRef.current?.pot || potAmount;
  }, [potAmount]);

  const getEngineState = useCallback(() => {
    return engineRef.current?.getState() || null;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    engine: engineRef.current,
    currentPlayerToAct,
    potAmount,
    availableActions,
    executeAction,
    getValidActionsForPlayer,
    isPlayerToAct,
    getCurrentPot,
    getEngineState,
    forceUpdate, // Include this to trigger re-renders
    error,
    isInitializing,
    clearError,
  };
};
