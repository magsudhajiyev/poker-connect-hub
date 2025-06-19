
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

  // Initialize engine when players and blinds are available
  useEffect(() => {
    console.log('usePokerGameEngine effect triggered:', {
      players: players?.length,
      smallBlind,
      bigBlind,
      currentStreet
    });

    if (players && players.length >= 2 && smallBlind && bigBlind) {
      const sb = parseFloat(smallBlind);
      const bb = parseFloat(bigBlind);
      
      if (!isNaN(sb) && !isNaN(bb) && sb > 0 && bb > 0) {
        console.log('Initializing poker game engine:', { 
          playersCount: players.length, 
          sb, 
          bb,
          playerDetails: players.map(p => ({ id: p.id, name: p.name, position: p.position }))
        });
        
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
          
          // Start preflop betting (UTG or first player after BB)
          const startIndex = players.length === 2 ? 0 : (players.findIndex(p => p.position === 'bb') + 1) % players.length;
          newEngine.startBettingRound(startIndex);
          
          setEngine(newEngine);
          engineRef.current = newEngine;
          
          // Get initial state
          const currentPlayer = newEngine.getCurrentPlayer();
          const legalActions = newEngine.getLegalActions();
          
          console.log('Initial engine state:', { currentPlayer, legalActions, pot: newEngine.pot });
          
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
  }, [players, smallBlind, bigBlind]);

  // Update street when it changes
  useEffect(() => {
    if (engine && currentStreet) {
      const streetMapping: { [key: string]: string } = {
        'preflopActions': 'preflop',
        'flopActions': 'flop',
        'turnActions': 'turn',
        'riverActions': 'river'
      };
      
      const engineStreet = streetMapping[currentStreet] || 'preflop';
      
      if (engine.street !== engineStreet) {
        console.log(`Updating engine street to: ${engineStreet}`);
        engine.street = engineStreet;
        
        // Reset betting for new street
        engine.players.forEach(p => {
          if (!p.folded) {
            p.bet = 0;
          }
        });
        engine.currentBet = 0;
        
        // Start new betting round
        const sbIndex = players.findIndex(p => p.position === 'sb');
        engine.startBettingRound(sbIndex >= 0 ? sbIndex : 0);
        
        const currentPlayer = engine.getCurrentPlayer();
        const legalActions = engine.getLegalActions();
        
        console.log('Updated engine state after street change:', { currentPlayer, legalActions });
        
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
  }, [engine, currentStreet, players]);

  const executeAction = (actionType: string, amount?: number): boolean => {
    if (!engineRef.current) {
      console.warn('No engine available to execute action');
      return false;
    }

    console.log(`Executing action: ${actionType}`, { amount });
    
    const success = engineRef.current.takeAction(actionType, amount || 0);
    
    if (success) {
      const currentPlayer = engineRef.current.getCurrentPlayer();
      const legalActions = engineRef.current.getLegalActions();
      
      console.log('New state after action:', { currentPlayer, legalActions, pot: engineRef.current.pot });
      
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
      console.log('No engine available for getValidActionsForPlayer');
      return [];
    }
    
    const currentPlayer = engineRef.current.getCurrentPlayer();
    
    if (currentPlayer && currentPlayer.id === playerId) {
      const actions = engineRef.current.getLegalActions();
      console.log('Player matches current player to act, returning actions:', actions);
      return actions;
    }
    
    console.log('Player does not match current player to act');
    return [];
  };

  const isPlayerToAct = (playerId: string): boolean => {
    const result = currentPlayerToAct === playerId;
    console.log('isPlayerToAct check:', { playerId, currentPlayerToAct, result });
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
    getEngineState
  };
};
