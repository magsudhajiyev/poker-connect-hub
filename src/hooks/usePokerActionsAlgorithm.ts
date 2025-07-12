import { useState, useEffect, useRef } from 'react';
import { PokerActionsAlgorithm } from '@/utils/PokerActionsAlgorithm';
import { Player } from '@/types/shareHand';

interface UsePokerActionsAlgorithmProps {
  players: Player[];
  smallBlind: string;
  bigBlind: string;
  currentStreet: string;
}

export const usePokerActionsAlgorithm = ({
  players,
  smallBlind,
  bigBlind,
  currentStreet,
}: UsePokerActionsAlgorithmProps) => {
  const [algorithm, setAlgorithm] = useState<PokerActionsAlgorithm | null>(null);
  const [currentPlayerToAct, setCurrentPlayerToAct] = useState<string | null>(null);
  const [potAmount, setPotAmount] = useState<number>(0);
  const [availableActions, setAvailableActions] = useState<any[]>([]);
  const algorithmRef = useRef<PokerActionsAlgorithm | null>(null);

  // Initialize algorithm when players and blinds are available
  useEffect(() => {
    if (players && players.length >= 2 && smallBlind && bigBlind) {
      const sb = parseFloat(smallBlind);
      const bb = parseFloat(bigBlind);

      if (!isNaN(sb) && !isNaN(bb) && sb > 0 && bb > 0) {
        try {
          const newAlgorithm = new PokerActionsAlgorithm(sb, bb, players as any);
          setAlgorithm(newAlgorithm);
          algorithmRef.current = newAlgorithm;

          // Get initial state
          const currentState = newAlgorithm.getCurrentPlayerActions();

          // Check if this is a normal player action state
          if (currentState && 'playerId' in currentState && currentState.playerId) {
            setCurrentPlayerToAct(String(currentState.playerId));
            setAvailableActions(currentState.actions || []);
          } else {
            // Handle other state types
            setCurrentPlayerToAct(null);
            setAvailableActions([]);
          }
          setPotAmount(currentState.pot || newAlgorithm.pot);
        } catch (error) {
          console.error('Error initializing poker algorithm:', error);
        }
      } else {
        console.warn('Invalid blind values for algorithm:', { sb, bb, smallBlind, bigBlind });
      }
    } else {
      // No valid players found
    }
  }, [players, smallBlind, bigBlind]);

  // Update street when it changes
  useEffect(() => {
    if (algorithm && currentStreet) {
      const streetMapping: { [key: string]: 'preflop' | 'flop' | 'turn' | 'river' } = {
        preflopActions: 'preflop',
        flopActions: 'flop',
        turnActions: 'turn',
        riverActions: 'river',
      };

      const algorithmStreet = streetMapping[currentStreet] || 'preflop';

      if (algorithm.currentStreet !== algorithmStreet) {
        algorithm.currentStreet = algorithmStreet as 'preflop' | 'flop' | 'turn' | 'river';
        algorithm.updateActionOrder();

        const currentState = algorithm.getCurrentPlayerActions();

        // Check if this is a normal player action state
        if (currentState && 'playerId' in currentState && currentState.playerId) {
          setCurrentPlayerToAct(String(currentState.playerId));
          setAvailableActions(currentState.actions || []);
        } else {
          // Handle other state types
          setCurrentPlayerToAct(null);
          setAvailableActions([]);
        }
        setPotAmount(currentState.pot || algorithm.pot);
      }
    }
  }, [algorithm, currentStreet]);

  const executeAction = (actionType: string, amount?: number) => {
    if (!algorithmRef.current) {
      console.warn('No algorithm available to execute action');
      return false;
    }

    const success = algorithmRef.current.executeAction(actionType, amount || 0);

    if (success) {
      // Get updated state
      const newState = algorithmRef.current.getCurrentPlayerActions();

      // Update pot
      setPotAmount(algorithmRef.current.pot);

      // Check if this is a normal player action state
      if (newState && 'playerId' in newState && newState.playerId) {
        setCurrentPlayerToAct(String(newState.playerId));
        setAvailableActions(newState.actions || []);
      } else {
        // No more players to act or hand complete
        setCurrentPlayerToAct(null);
        setAvailableActions([]);
      }

      return true;
    }

    return false;
  };

  const getValidActionsForPlayer = (playerId: string) => {
    if (!algorithmRef.current) {
      return [];
    }

    const currentState = algorithmRef.current.getCurrentPlayerActions();

    // Check if this is a normal player action state and the player matches
    if (currentState && 'playerId' in currentState && currentState.playerId === playerId) {
      return currentState.actions || [];
    }

    return [];
  };

  const isPlayerToAct = (playerId: string) => {
    const result = currentPlayerToAct === playerId;
    return result;
  };

  const getCurrentPot = () => {
    return algorithmRef.current?.pot || potAmount;
  };

  const getAlgorithmState = () => {
    return algorithmRef.current?.getHandSummary() || null;
  };

  return {
    algorithm: algorithmRef.current,
    currentPlayerToAct,
    potAmount,
    availableActions,
    executeAction,
    getValidActionsForPlayer,
    isPlayerToAct,
    getCurrentPot,
    getAlgorithmState,
  };
};
