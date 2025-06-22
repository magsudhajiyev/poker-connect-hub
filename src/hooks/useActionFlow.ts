import { useState, useEffect, useRef } from 'react';
import { Player } from '@/types/shareHand';
import {
  ActionType,
  StreetType,
  Position,
  getActionOrder,
  DEFAULT_VALUES,
  VALIDATION_MESSAGES,
  GAME_STATE
} from '@/constants';

interface ActionState {
  currentPlayerIndex: number;
  pot: number;
  currentBet: number;
  lastRaiserIndex: number | null;
  actions: Array<{
    playerId: string;
    action: ActionType;
    amount?: number;
  }>;
  playerBets: Map<string, number>;
  street: string; // Track current street to detect changes
  foldedPlayers: Set<string>; // Track folded players across all streets
  allInPlayers: Set<string>; // Track all-in players for this street
}

export const useActionFlow = (
  players: Player[], 
  smallBlind: number, 
  bigBlind: number, 
  street: string, 
  setFormData?: (updater: (prev: any) => any) => void,
  currentStep?: number,
) => {
  // Helper function to round stack sizes to avoid floating point precision issues
  const roundStackSize = (amount: number): number => {
    return Math.round(amount * 100) / 100;
  };

  // Track which players have had blinds deducted to prevent double deduction
  const deductedPlayersRef = useRef<Set<string>>(new Set());
  // Track if we've started actual gameplay (transitioned from positions to preflop)
  const gameStartedRef = useRef<boolean>(false);
  // Track the previous step to detect navigation transitions
  const previousStepRef = useRef<number | undefined>(undefined);

  // Get action order for current street using constants
  const getStreetActionOrder = (street: string): readonly Position[] => {
    const isPreflop = street === StreetType.PREFLOP;
    return getActionOrder(isPreflop);
  };

  const [actionState, setActionState] = useState<ActionState>({
    currentPlayerIndex: GAME_STATE.FIRST_PLAYER_INDEX,
    pot: smallBlind + bigBlind, // Start with blinds
    currentBet: street === StreetType.PREFLOP ? bigBlind : 0,
    lastRaiserIndex: null, // Will be set in useEffect when players are ready
    actions: [],
    playerBets: new Map(),
    street, // Track current street
    foldedPlayers: new Set(), // Track folded players
    allInPlayers: new Set(), // Track all-in players
  });

  // Get ordered players for current street (ALL players, including folded)
  const getOrderedPlayers = (): Player[] => {
    const order = getStreetActionOrder(street);
    const orderedPlayers: Player[] = [];
    
    for (const position of order) {
      const player = players.find(p => p.position === position);
      if (player) {
        orderedPlayers.push(player);
      }
    }
    
    return orderedPlayers;
  };

  const orderedPlayers = getOrderedPlayers();

  function getBBIndex(): number {
    return orderedPlayers.findIndex(p => p.position === Position.BIG_BLIND);
  }

  // Initialize action flow when players change or street changes
  useEffect(() => {
    if (orderedPlayers.length > 0) {
      const bbIndex = getBBIndex();
      const isStreetChange = actionState.street !== street;
      const isFirstInitialization = actionState.actions.length === 0;
      
      // Detect navigation to preflop (user clicked "Next" from positions step)
      const isNavigatingToPreflop = street === StreetType.PREFLOP && 
                                   !gameStartedRef.current && 
                                   orderedPlayers.length > 0 &&
                                   currentStep === 2 && // Currently on preflop step (index 2)
                                   previousStepRef.current === 1 && // Was on positions step (index 1)
                                   isFirstInitialization;
      
      console.log('🔄 useEffect triggered for street:', street, 'with', orderedPlayers.length, 'players');
      console.log('   isStreetChange:', isStreetChange, 'isFirstInit:', isFirstInitialization, 'isNavigatingToPreflop:', isNavigatingToPreflop);
      console.log('   currentStep:', currentStep, 'previousStep:', previousStepRef.current);
      
      // Only reinitialize if it's the first time OR street has changed OR navigating to preflop
      if (isFirstInitialization || isStreetChange || isNavigatingToPreflop) {
        const initialBets = new Map();
        let initialPot = actionState.pot; // Carry over pot from previous street
        let initialCurrentBet = 0; // Reset current bet for new street
        
        // Set initial blinds only for preflop
        if (street === StreetType.PREFLOP) {
          const sbPlayer = orderedPlayers.find(p => p.position === Position.SMALL_BLIND);
          const bbPlayer = orderedPlayers.find(p => p.position === Position.BIG_BLIND);
          if (sbPlayer) {
            initialBets.set(sbPlayer.id, smallBlind);
          }
          if (bbPlayer) {
            initialBets.set(bbPlayer.id, bigBlind);
          }
          initialPot = smallBlind + bigBlind;
          initialCurrentBet = bigBlind;

          // Mark game as started when navigating to preflop gameplay
          if (isNavigatingToPreflop) {
            gameStartedRef.current = true;
            console.log('🎮 Game started! User navigated from positions to preflop');
          }

          // CRITICAL: Deduct blind amounts only when navigating to preflop (not during positions setup)
          if (setFormData && isNavigatingToPreflop) {
            console.log('🛡️ Starting game - performing blind deduction...');
            console.log('   All players:', orderedPlayers.map(p => `${p.position}:${p.id}`));
            console.log('   SB Player found:', sbPlayer ? `${sbPlayer.position}:${sbPlayer.id}` : 'NOT FOUND');
            console.log('   BB Player found:', bbPlayer ? `${bbPlayer.position}:${bbPlayer.id}` : 'NOT FOUND');
            
            if (sbPlayer) {
              console.log('   SB player stack before deduction:', sbPlayer.stackSize?.[0]);
              deductedPlayersRef.current.add(sbPlayer.id);
              
              setFormData(prev => ({
                ...prev,
                players: prev.players.map(p => 
                  p.id === sbPlayer.id 
                    ? { ...p, stackSize: [Math.max(0, p.stackSize[0] - smallBlind), p.stackSize[1]] }
                    : p
                )
              }));
              console.log('✅ SB Blind Deduction EXECUTED:', sbPlayer.position, 'deducted:', smallBlind);
            } else {
              console.log('❌ SB Player NOT FOUND - cannot deduct blind');
            }
            
            if (bbPlayer) {
              console.log('   BB player stack before deduction:', bbPlayer.stackSize?.[0]);
              deductedPlayersRef.current.add(bbPlayer.id);
              
              setFormData(prev => ({
                ...prev,
                players: prev.players.map(p => 
                  p.id === bbPlayer.id 
                    ? { ...p, stackSize: [Math.max(0, p.stackSize[0] - bigBlind), p.stackSize[1]] }
                    : p
                )
              }));
              console.log('✅ BB Blind Deduction EXECUTED:', bbPlayer.position, 'deducted:', bigBlind);
            } else {
              console.log('❌ BB Player NOT FOUND - cannot deduct blind');
            }
            
            console.log('🏁 Game start blind deduction complete');
          } else if (setFormData && !isNavigatingToPreflop) {
            console.log('🚫 Blind deduction SKIPPED - not navigating to preflop (positions step or re-render)');
          }
        }
        // For post-flop streets, reset player bets to 0 but keep pot
        else {
          // Reset all player bets for new street
          orderedPlayers.forEach(player => {
            initialBets.set(player.id, 0);
          });
        }
        
        setActionState(prev => ({
          currentPlayerIndex: GAME_STATE.FIRST_PLAYER_INDEX,
          pot: initialPot,
          currentBet: initialCurrentBet,
          lastRaiserIndex: street === StreetType.PREFLOP ? bbIndex : null,
          actions: [],
          playerBets: initialBets,
          street,
          foldedPlayers: street === StreetType.PREFLOP ? new Set() : prev.foldedPlayers, // Preserve folded players across streets
          allInPlayers: street === StreetType.PREFLOP ? new Set() : prev.allInPlayers, // Preserve all-in players across streets
        }));
      }
    }
    
    // Track step changes for next render
    if (currentStep !== undefined) {
      previousStepRef.current = currentStep;
    }
  }, [street, orderedPlayers.length, currentStep]); // Trigger on street changes, player list changes, and step changes

  // Check if all remaining active players are all-in (no action needed)
  const areAllActivePlayersAllIn = (): boolean => {
    const activePlayers = orderedPlayers.filter(p => !actionState.foldedPlayers.has(p.id));
    const activeNonAllInPlayers = activePlayers.filter(p => !actionState.allInPlayers.has(p.id));
    
    // Case 1: No players can act (all folded or all-in) - hand is over
    if (activeNonAllInPlayers.length === 0) {
      return true;
    }
    
    // Case 2: Only 1 active player remains (others folded) - hand is over  
    if (activePlayers.length === 1) {
      return true;
    }
    
    // Case 3: Multiple active players but all are all-in - no action needed for rest of hand
    if (activePlayers.length > 1 && activeNonAllInPlayers.length === 0) {
      return true;
    }
    
    // Case 4: Big stack scenario - if only one player has chips but everyone else is all-in
    // Even though one player can "act", there's no one to bet against
    if (activeNonAllInPlayers.length === 1 && activePlayers.length > 1) {
      const otherActivePlayers = activePlayers.filter(p => !activeNonAllInPlayers.includes(p));
      const allOthersAllIn = otherActivePlayers.every(p => actionState.allInPlayers.has(p.id));
      
      if (allOthersAllIn) {
        return true;
      }
    }
    
    // Case 5: At least one player can still act AND there are others who can respond
    if (activeNonAllInPlayers.length > 0) {
      return false;
    }
    
    return false;
  };

  // Check if betting round is complete
  const isBettingRoundComplete = (): boolean => {
    // Count active (non-folded) players
    const activePlayers = orderedPlayers.filter(p => !actionState.foldedPlayers.has(p.id));
    // Count players who can still act (non-folded, non-all-in)
    const playersWhoCanAct = orderedPlayers.filter(p => 
      !actionState.foldedPlayers.has(p.id) && 
      !actionState.allInPlayers.has(p.id),
    );
    
    // If only one active player remains, round is complete
    if (activePlayers.length <= GAME_STATE.ROUND_COMPLETE_THRESHOLD) {
      return true;
    }
    
    // Special logic for all-in scenarios
    if (actionState.allInPlayers.size > 0) {
      // Find when the first all-in occurred in this round
      const allInActionIndex = actionState.actions.findIndex(action => action.action === ActionType.ALL_IN);
      
      // Count players who were active when the all-in happened and haven't acted since
      const playersWhoNeedToRespondToAllIn = activePlayers.filter(player => {
        // Skip the all-in player themselves
        if (actionState.allInPlayers.has(player.id)) {
          return false;
        }
        
        // Skip folded players  
        if (actionState.foldedPlayers.has(player.id)) {
          return false;
        }
        
        // Check if this player has acted AFTER the all-in occurred
        const playerActionsAfterAllIn = actionState.actions.slice(allInActionIndex + 1)
          .filter(action => action.playerId === player.id);
        
        // If they haven't acted since all-in, they need to respond
        return playerActionsAfterAllIn.length === 0;
      });
      
      if (playersWhoNeedToRespondToAllIn.length > 0) {
        return false;
      } else {
        return true;
      }
    }
    
    // Regular betting round logic (no all-ins)
    
    // If only one player can act and no all-ins, round is complete
    if (playersWhoCanAct.length <= GAME_STATE.ROUND_COMPLETE_THRESHOLD) {
      return true;
    }
    
    // If we haven't gone around the table once yet, continue
    if (actionState.currentPlayerIndex < orderedPlayers.length) {
      return false;
    }
    
    // If no one has raised (no lastRaiserIndex), round is complete after going around once
    if (actionState.lastRaiserIndex === null) {
      return true;
    }
    
    // Round is complete when we get back to the last raiser (but only after going around at least once)
    const adjustedIndex = actionState.currentPlayerIndex % orderedPlayers.length;
    const isBackToRaiser = adjustedIndex === actionState.lastRaiserIndex;
    return isBackToRaiser;
  };

  // Get current player to act (skip folded and all-in players)
  const getCurrentPlayer = (): Player | null => {
    // First check if all active players are all-in (no action needed)
    if (areAllActivePlayersAllIn()) {
      return null;
    }
    
    const roundComplete = isBettingRoundComplete();
    
    if (roundComplete) {
      return null; // Round complete
    }
    
    // Find the next active (non-folded, non-all-in) player starting from current index
    let searchIndex = actionState.currentPlayerIndex;
    const maxSearches = orderedPlayers.length * 2; // Prevent infinite loop
    
    for (let i = 0; i < maxSearches; i++) {
      const adjustedIndex = searchIndex % orderedPlayers.length;
      const player = orderedPlayers[adjustedIndex];
      
      if (player && 
          !actionState.foldedPlayers.has(player.id) && 
          !actionState.allInPlayers.has(player.id)) {
        return player;
      }
      
      searchIndex++;
    }
    
    // If no active players found, return null
    return null;
  };

  // Check if specific player is to act
  const isPlayerToAct = (playerId: string): boolean => {
    const currentPlayer = getCurrentPlayer();
    return currentPlayer?.id === playerId;
  };

  // Get available actions for current player
  const getAvailableActions = (playerId: string): ActionType[] => {
    if (!isPlayerToAct(playerId)) {
      return [];
    }

    const player = players.find(p => p.id === playerId);
    if (!player) {
      return [];
    }

    const playerCurrentBet = actionState.playerBets.get(playerId) || 0;
    const amountToCall = Math.max(0, actionState.currentBet - playerCurrentBet);
    
    // Check if someone has gone all-in this round
    const hasAllInThisRound = actionState.allInPlayers.size > 0;
    
    // Calculate player's remaining stack
    const playerStackSize = player.stackSize?.[0] || DEFAULT_VALUES.STACK_SIZE;
    const remainingStack = playerStackSize - playerCurrentBet;
    
    const actions: ActionType[] = [ActionType.FOLD];
    
    // Logic: After an all-in, players can only fold, call, or all-in (no raise/bet unless they can cover)
    
    if (actionState.currentBet === 0) {
      // No active bet this round - can check or bet
      actions.push(ActionType.CHECK);
      if (!hasAllInThisRound && remainingStack > 0) {
        actions.push(ActionType.BET);
      }
    } else {
      // There's an active bet this round
      if (amountToCall > 0) {
        // Player owes money - can call if they have enough stack
        if (remainingStack >= amountToCall) {
          actions.push(ActionType.CALL);
        }
        
        // Can only raise if no one has gone all-in and player has enough stack
        if (!hasAllInThisRound && remainingStack > amountToCall) {
          actions.push(ActionType.RAISE);
        }
      } else {
        // Player has already matched the current bet - can check
        actions.push(ActionType.CHECK);
        
        // Can raise if no all-in players and has remaining stack
        if (!hasAllInThisRound && remainingStack > 0) {
          actions.push(ActionType.RAISE);
        }
      }
    }
    
    // All-in available if player has remaining stack and isn't already all-in
    if (!actionState.allInPlayers.has(playerId) && remainingStack > 0) {
      actions.push(ActionType.ALL_IN);
    }
    
    return actions;
  };

  // Execute action
  const executeAction = (playerId: string, action: ActionType, amount?: number): boolean => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== playerId) {
      return false;
    }

    const playerCurrentBet = actionState.playerBets.get(playerId) || 0;
    const amountToCall = Math.max(0, actionState.currentBet - playerCurrentBet);

    let newPot = actionState.pot;
    let newCurrentBet = actionState.currentBet;
    let newLastRaiserIndex = actionState.lastRaiserIndex;
    const newPlayerBets = new Map(actionState.playerBets);
    
    switch (action) {
      case ActionType.FOLD:
        // Player will be added to folded players in the main state update below
        break;
        
      case ActionType.CHECK:
        if (amountToCall > 0) {
          return false;
        }
        break;
        
      case ActionType.CALL:
        // If amount is provided, use it as the total amount to add to pot
        // Otherwise, calculate the minimum amount needed to call
        const callAmount = amount || amountToCall;
        
        if (callAmount === 0) {
          return false;
        }
        
        // Check if player has enough stack to call
        const playerStackSize = currentPlayer.stackSize?.[0] || DEFAULT_VALUES.STACK_SIZE;
        
        if (playerStackSize < callAmount) {
          return false;
        }
        
        // Add the call amount to pot and update player's total bet
        newPot += callAmount;
        newPlayerBets.set(playerId, playerCurrentBet + callAmount);
        
        // Update player stack in formData - deduct the call amount
        if (setFormData) {
          const newStackSize = roundStackSize(Math.max(0, playerStackSize - callAmount));
          console.log('📞 CALL Stack Update:', currentPlayer.position, 'stack:', playerStackSize, 'callAmount:', callAmount, 'wasExplicit:', !!amount, '→', newStackSize);
          setFormData(prev => ({
            ...prev,
            players: prev.players.map(p => 
              p.id === playerId 
                ? { ...p, stackSize: [newStackSize, p.stackSize[1]] }
                : p,
            ),
          }));
        }
        break;
        
      case ActionType.BET:
        if (actionState.currentBet > 0) {
          return false;
        }
        if (!amount || amount <= 0) {
          return false;
        }
        newPot += amount;
        newCurrentBet = amount;
        newPlayerBets.set(playerId, amount);
        newLastRaiserIndex = actionState.currentPlayerIndex % orderedPlayers.length;
        
        // Update player stack in formData
        if (setFormData) {
          const playerStackSize = currentPlayer.stackSize?.[0] || DEFAULT_VALUES.STACK_SIZE;
          const newStackSize = roundStackSize(Math.max(0, playerStackSize - amount));
          setFormData(prev => ({
            ...prev,
            players: prev.players.map(p => 
              p.id === playerId 
                ? { ...p, stackSize: [newStackSize, p.stackSize[1]] }
                : p,
            ),
          }));
        }
        break;
        
      case ActionType.RAISE:
        if (actionState.currentBet === 0) {
          return false;
        }
        if (!amount || amount <= 0) {
          return false;
        }
        // amount is the total bet amount (e.g., raise to 60 = total bet becomes 60)
        const totalBetAmount = amount;
        const additionalAmount = totalBetAmount - playerCurrentBet; // How much more they're adding
        
        newPot += additionalAmount; // Only add the additional amount to pot
        newCurrentBet = totalBetAmount; // New current bet is the total amount
        newPlayerBets.set(playerId, totalBetAmount); // Player's total bet is the amount
        newLastRaiserIndex = actionState.currentPlayerIndex % orderedPlayers.length;
        
        // Update player stack in formData - deduct only the additional amount
        if (setFormData) {
          const playerStackSize = currentPlayer.stackSize?.[0] || DEFAULT_VALUES.STACK_SIZE;
          const newStackSize = roundStackSize(Math.max(0, playerStackSize - additionalAmount));
          console.log('🚀 RAISE Stack Update:', currentPlayer.position, 'stack:', playerStackSize, 'totalBet:', totalBetAmount, 'additional:', additionalAmount, '→', newStackSize);
          setFormData(prev => ({
            ...prev,
            players: prev.players.map(p => 
              p.id === playerId 
                ? { ...p, stackSize: [newStackSize, p.stackSize[1]] }
                : p,
            ),
          }));
        }
        break;
        
      case ActionType.ALL_IN:
        // Use player's actual stack size or default
        const allInPlayerStackSize = currentPlayer.stackSize?.[0] || DEFAULT_VALUES.STACK_SIZE;
        const allInAmount = allInPlayerStackSize - playerCurrentBet;
        
        if (allInAmount <= 0) {
          return false;
        }
        
        newPot += allInAmount;
        if (playerCurrentBet + allInAmount > actionState.currentBet) {
          newCurrentBet = playerCurrentBet + allInAmount;
          newLastRaiserIndex = actionState.currentPlayerIndex % orderedPlayers.length;
        }
        newPlayerBets.set(playerId, playerCurrentBet + allInAmount);
        
        // Update player stack in formData (set to 0 since they went all-in)
        if (setFormData) {
          setFormData(prev => ({
            ...prev,
            players: prev.players.map(p => 
              p.id === playerId 
                ? { ...p, stackSize: [0, p.stackSize[1]] }
                : p,
            ),
          }));
        }
        break;
        
      default:
        return false;
    }

    // Record action
    const newAction = {
      playerId,
      action,
      amount: amount || 0,
    };

    // Advance to next player
    const nextPlayerIndex = actionState.currentPlayerIndex + 1;

    setActionState(prev => {
      // Update folded players if this is a fold action
      const newFoldedPlayers = action === ActionType.FOLD 
        ? new Set([...prev.foldedPlayers, playerId])
        : prev.foldedPlayers;
        
      // Update all-in players if this is an all-in action
      const newAllInPlayers = action === ActionType.ALL_IN
        ? new Set([...prev.allInPlayers, playerId])
        : prev.allInPlayers;
        
      return {
        currentPlayerIndex: nextPlayerIndex,
        pot: newPot,
        currentBet: newCurrentBet,
        lastRaiserIndex: newLastRaiserIndex,
        actions: [...prev.actions, newAction],
        playerBets: newPlayerBets,
        street: prev.street, // Keep current street
        foldedPlayers: newFoldedPlayers, // Update folded players
        allInPlayers: newAllInPlayers, // Update all-in players
      };
    });

    return true;
  };

  return {
    currentPlayer: getCurrentPlayer(),
    isPlayerToAct,
    getAvailableActions,
    executeAction,
    pot: actionState.pot,
    actions: actionState.actions,
    isRoundComplete: isBettingRoundComplete(),
    areAllActivePlayersAllIn: areAllActivePlayersAllIn(),
    currentBet: actionState.currentBet,
    playerBets: actionState.playerBets,
  };
};