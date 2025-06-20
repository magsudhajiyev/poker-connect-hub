
import { useState, useEffect, useRef } from 'react';
import { PokerGameEngine } from '@/utils/PokerGameEngine';
import { Player } from '@/types/shareHand';

interface UsePokerGameEngineProps {
  players: Player[];
  smallBlind: string;
  bigBlind: string;
  currentStreet: string;
}

export const usePokerGameEngine = ({
  players,
  smallBlind,
  bigBlind,
  currentStreet
}: UsePokerGameEngineProps) => {
  const [engine, setEngine] = useState<PokerGameEngine | null>(null);
  const [currentPlayerToAct, setCurrentPlayerToAct] = useState<string | null>(null);
  const [potAmount, setPotAmount] = useState<number>(0);
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [forceUpdate, setForceUpdate] = useState<number>(0);
  const engineRef = useRef<PokerGameEngine | null>(null);
  const initializedRef = useRef<boolean>(false);

  // Initialize engine when players and blinds are available
  useEffect(() => {
    if (players && players.length >= 2 && smallBlind && bigBlind && !initializedRef.current) {
      const sb = parseFloat(smallBlind);
      const bb = parseFloat(bigBlind);
      
      if (!isNaN(sb) && !isNaN(bb) && sb > 0 && bb > 0) {
        console.log('Initializing poker game engine');
        
        try {
          console.log('INITIALIZING POKER ENGINE with players:', players.map(p => ({ id: p.id, name: p.name, position: p.position })));
          const newEngine = new PokerGameEngine(players, sb, bb);
          
          // Find SB and BB positions
          const sbPlayer = players.find(p => p.position === 'sb');
          const bbPlayer = players.find(p => p.position === 'bb');
          
          console.log('Found SB/BB:', { sbPlayer: sbPlayer?.name, bbPlayer: bbPlayer?.name });
          
          if (sbPlayer && bbPlayer) {
            const sbIndex = players.indexOf(sbPlayer);
            const bbIndex = players.indexOf(bbPlayer);
            console.log('Posting blinds at indices:', { sbIndex, bbIndex });
            newEngine.postBlinds(sbIndex, bbIndex);
          }
          
          // Start preflop betting with proper position ordering
          newEngine.startBettingRound();
          
          setEngine(newEngine);
          engineRef.current = newEngine;
          initializedRef.current = true;
          
          // Get initial state
          const currentPlayer = newEngine.getCurrentPlayer();
          const legalActions = newEngine.getLegalActions();
          
          console.log('ENGINE INITIALIZED:', {
            currentPlayer: currentPlayer ? { id: currentPlayer.id, name: currentPlayer.name, position: currentPlayer.position } : null,
            legalActions,
            pot: newEngine.pot,
            allPlayers: newEngine.players.map(p => ({ id: p.id, name: p.name, position: p.position, bet: p.bet, stack: p.stack }))
          });
          
          if (currentPlayer) {
            setCurrentPlayerToAct(currentPlayer.id);
            setAvailableActions(legalActions);
          } else {
            setCurrentPlayerToAct(null);
            setAvailableActions([]);
          }
          
          setPotAmount(newEngine.pot);
        } catch (error) {
          console.error('Error initializing poker engine:', error);
        }
      }
    }
    
    // Reset when players change significantly
    if (!players || players.length < 2) {
      initializedRef.current = false;
    }
  }, [players?.length, smallBlind, bigBlind]);

  // Update street when it changes
  useEffect(() => {
    if (engine && currentStreet && initializedRef.current) {
      const streetMapping: { [key: string]: string } = {
        'preflopActions': 'preflop',
        'flopActions': 'flop',
        'turnActions': 'turn',
        'riverActions': 'river'
      };
      
      const engineStreet = streetMapping[currentStreet] || 'preflop';
      
      if (engine.street !== engineStreet) {
        engine.street = engineStreet;
        
        // Reset betting for new street
        engine.players.forEach(p => {
          if (!p.folded) {
            p.bet = 0;
          }
        });
        engine.currentBet = 0;
        
        // Start new betting round with proper position ordering
        engine.startBettingRound();
        
        const currentPlayer = engine.getCurrentPlayer();
        const legalActions = engine.getLegalActions();
        
        if (currentPlayer) {
          setCurrentPlayerToAct(currentPlayer.id);
          setAvailableActions(legalActions);
        } else {
          setCurrentPlayerToAct(null);
          setAvailableActions([]);
        }
        
        setPotAmount(engine.pot);
      }
    }
  }, [currentStreet]);

  const executeAction = (actionType: string, amount?: number): boolean => {
    if (!engineRef.current) {
      return false;
    }

    console.log('Executing action:', { actionType, amount, currentPot: engineRef.current.pot });
    const success = engineRef.current.takeAction(actionType, amount || 0);
    
    if (success) {
      const currentPlayer = engineRef.current.getCurrentPlayer();
      const legalActions = engineRef.current.getLegalActions();
      
      // Update state to trigger re-renders
      const newPotAmount = engineRef.current.pot;
      console.log('Action successful, updating pot from', potAmount, 'to', newPotAmount);
      setPotAmount(newPotAmount);
      
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        if (currentPlayer) {
          console.log('Setting next player to act:', currentPlayer.name, currentPlayer.position, currentPlayer.id);
          setCurrentPlayerToAct(currentPlayer.id);
          setAvailableActions(legalActions);
        } else {
          console.log('No more players to act');
          setCurrentPlayerToAct(null);
          setAvailableActions([]);
        }
        
        // Force component re-render
        setForceUpdate(prev => prev + 1);
      }, 100); // Small delay to ensure state updates
      
      return true;
    } else {
      console.log('Action failed');
    }
    
    return false;
  };

  const getValidActionsForPlayer = (playerId: string): string[] => {
    if (!engineRef.current) {
      return [];
    }
    
    const currentPlayer = engineRef.current.getCurrentPlayer();
    
    if (currentPlayer && currentPlayer.id === playerId) {
      const actions = engineRef.current.getLegalActions();
      return actions;
    }
    
    return [];
  };

  const isPlayerToAct = (playerId: string): boolean => {
    const result = currentPlayerToAct === playerId;
    if (result) {
      console.log(`✓ Player ${playerId} is to act (current: ${currentPlayerToAct})`);
    }
    return result;
  };

  const getCurrentPot = (): number => {
    return engineRef.current?.pot || potAmount;
  };

  const getEngineState = () => {
    return engineRef.current?.getState() || null;
  };

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
    forceUpdate // Include this to trigger re-renders
  };
};
