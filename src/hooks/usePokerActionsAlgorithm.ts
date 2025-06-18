
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
  currentStreet
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
        console.log('Initializing poker actions algorithm:', { players, sb, bb });
        
        const newAlgorithm = new PokerActionsAlgorithm(sb, bb, players);
        setAlgorithm(newAlgorithm);
        algorithmRef.current = newAlgorithm;
        
        // Get initial state
        const currentState = newAlgorithm.getCurrentPlayerActions();
        console.log('Initial algorithm state:', currentState);
        
        if (currentState.playerId) {
          setCurrentPlayerToAct(currentState.playerId);
          setAvailableActions(currentState.actions || []);
        }
        setPotAmount(currentState.pot || newAlgorithm.pot);
      }
    }
  }, [players, smallBlind, bigBlind]);

  // Update street when it changes
  useEffect(() => {
    if (algorithm && currentStreet) {
      const streetMapping: { [key: string]: string } = {
        'preflopActions': 'preFlop',
        'flopActions': 'flop',
        'turnActions': 'turn',
        'riverActions': 'river'
      };
      
      const algorithmStreet = streetMapping[currentStreet] || 'preFlop';
      
      if (algorithm.currentStreet !== algorithmStreet) {
        console.log(`Updating algorithm street to: ${algorithmStreet}`);
        algorithm.currentStreet = algorithmStreet;
        algorithm.updateActionOrder();
        
        const currentState = algorithm.getCurrentPlayerActions();
        console.log('Updated algorithm state after street change:', currentState);
        
        if (currentState.playerId) {
          setCurrentPlayerToAct(currentState.playerId);
          setAvailableActions(currentState.actions || []);
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

    console.log(`Executing action: ${actionType}`, { amount });
    
    const success = algorithmRef.current.executeAction(actionType, amount || 0);
    
    if (success) {
      // Get updated state
      const newState = algorithmRef.current.getCurrentPlayerActions();
      console.log('New state after action:', newState);
      
      // Update pot
      setPotAmount(algorithmRef.current.pot);
      
      // Update current player to act
      if (newState.playerId) {
        setCurrentPlayerToAct(newState.playerId);
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
    if (!algorithmRef.current) return [];
    
    const currentState = algorithmRef.current.getCurrentPlayerActions();
    
    if (currentState.playerId === playerId) {
      return currentState.actions || [];
    }
    
    return [];
  };

  const isPlayerToAct = (playerId: string) => {
    return currentPlayerToAct === playerId;
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
    getAlgorithmState
  };
};
