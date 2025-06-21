
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
    console.log('usePokerActionsAlgorithm effect triggered:', {
      players: players?.length,
      smallBlind,
      bigBlind,
      currentStreet,
    });

    if (players && players.length >= 2 && smallBlind && bigBlind) {
      const sb = parseFloat(smallBlind);
      const bb = parseFloat(bigBlind);
      
      if (!isNaN(sb) && !isNaN(bb) && sb > 0 && bb > 0) {
        console.log('Initializing poker actions algorithm:', { 
          playersCount: players.length, 
          sb, 
          bb,
          playerDetails: players.map(p => ({ id: p.id, name: p.name, position: p.position })),
        });
        
        try {
          const newAlgorithm = new PokerActionsAlgorithm(sb, bb, players);
          setAlgorithm(newAlgorithm);
          algorithmRef.current = newAlgorithm;
          
          // Get initial state
          const currentState = newAlgorithm.getCurrentPlayerActions();
          console.log('Initial algorithm state:', currentState);
          
          // Check if this is a normal player action state
          if (currentState && 'playerId' in currentState && currentState.playerId) {
            setCurrentPlayerToAct(currentState.playerId);
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
      console.log('Algorithm initialization skipped:', {
        hasPlayers: Boolean(players),
        playersLength: players?.length,
        hasSmallBlind: Boolean(smallBlind),
        hasBigBlind: Boolean(bigBlind),
      });
    }
  }, [players, smallBlind, bigBlind]);

  // Update street when it changes
  useEffect(() => {
    if (algorithm && currentStreet) {
      const streetMapping: { [key: string]: string } = {
        'preflopActions': 'preFlop',
        'flopActions': 'flop',
        'turnActions': 'turn',
        'riverActions': 'river',
      };
      
      const algorithmStreet = streetMapping[currentStreet] || 'preFlop';
      
      if (algorithm.currentStreet !== algorithmStreet) {
        console.log(`Updating algorithm street to: ${algorithmStreet}`);
        algorithm.currentStreet = algorithmStreet;
        algorithm.updateActionOrder();
        
        const currentState = algorithm.getCurrentPlayerActions();
        console.log('Updated algorithm state after street change:', currentState);
        
        // Check if this is a normal player action state
        if (currentState && 'playerId' in currentState && currentState.playerId) {
          setCurrentPlayerToAct(currentState.playerId);
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

    console.log(`Executing action: ${actionType}`, { amount });
    
    const success = algorithmRef.current.executeAction(actionType, amount || 0);
    
    if (success) {
      // Get updated state
      const newState = algorithmRef.current.getCurrentPlayerActions();
      console.log('New state after action:', newState);
      
      // Update pot
      setPotAmount(algorithmRef.current.pot);
      
      // Check if this is a normal player action state
      if (newState && 'playerId' in newState && newState.playerId) {
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
    if (!algorithmRef.current) {
      console.log('No algorithm available for getValidActionsForPlayer');
      return [];
    }
    
    const currentState = algorithmRef.current.getCurrentPlayerActions();
    console.log('Getting valid actions for player:', playerId, 'Current state:', currentState);
    
    // Check if this is a normal player action state and the player matches
    if (currentState && 'playerId' in currentState && currentState.playerId === playerId) {
      console.log('Player matches current player to act, returning actions:', currentState.actions);
      return currentState.actions || [];
    }
    
    console.log('Player does not match current player to act');
    return [];
  };

  const isPlayerToAct = (playerId: string) => {
    const result = currentPlayerToAct === playerId;
    console.log('isPlayerToAct check:', { playerId, currentPlayerToAct, result });
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
