
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
          const newEngine = new PokerGameEngine(players, sb, bb);
          
          // Find SB and BB positions
          const sbPlayer = players.find(p => p.position === 'sb');
          const bbPlayer = players.find(p => p.position === 'bb');
          
          if (sbPlayer && bbPlayer) {
            const sbIndex = players.indexOf(sbPlayer);
            const bbIndex = players.indexOf(bbPlayer);
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
          
          console.log('Engine initialized successfully');
          
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

    const success = engineRef.current.takeAction(actionType, amount || 0);
    
    if (success) {
      const currentPlayer = engineRef.current.getCurrentPlayer();
      const legalActions = engineRef.current.getLegalActions();
      
      // Update state
      setPotAmount(engineRef.current.pot);
      
      if (currentPlayer) {
        setCurrentPlayerToAct(currentPlayer.id);
        setAvailableActions(legalActions);
      } else {
        setCurrentPlayerToAct(null);
        setAvailableActions([]);
      }
      
      return true;
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
    return currentPlayerToAct === playerId;
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
    getEngineState
  };
};
