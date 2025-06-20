import { useState, useEffect } from 'react';
import { Player } from '@/types/shareHand';
import {
  ActionType,
  StreetType,
  Position,
  getActionOrder,
  streetToGameRound,
  DEFAULT_VALUES,
  BETTING_CONSTRAINTS,
  VALIDATION_MESSAGES,
  LOG_MESSAGES,
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

export const useActionFlow = (players: Player[], smallBlind: number, bigBlind: number, street: string) => {
  // Get action order for current street using constants
  const getStreetActionOrder = (street: string): Position[] => {
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
    street: street, // Track current street
    foldedPlayers: new Set(), // Track folded players
    allInPlayers: new Set() // Track all-in players
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
      
      // Only reinitialize if it's the first time OR street has changed
      if (isFirstInitialization || isStreetChange) {
        console.log(LOG_MESSAGES.ACTION_FLOW_RESET, {
          reason: isFirstInitialization ? 'first-init' : 'street-change',
          oldStreet: actionState.street,
          newStreet: street
        });
        
        const initialBets = new Map();
        let initialPot = actionState.pot; // Carry over pot from previous street
        let initialCurrentBet = 0; // Reset current bet for new street
        
        // Set initial blinds only for preflop
        if (street === StreetType.PREFLOP) {
          const sbPlayer = orderedPlayers.find(p => p.position === Position.SMALL_BLIND);
          const bbPlayer = orderedPlayers.find(p => p.position === Position.BIG_BLIND);
          if (sbPlayer) initialBets.set(sbPlayer.id, smallBlind);
          if (bbPlayer) initialBets.set(bbPlayer.id, bigBlind);
          initialPot = smallBlind + bigBlind;
          initialCurrentBet = bigBlind;
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
          street: street,
          foldedPlayers: street === StreetType.PREFLOP ? new Set() : prev.foldedPlayers, // Preserve folded players across streets
          allInPlayers: street === StreetType.PREFLOP ? new Set() : prev.allInPlayers // Preserve all-in players across streets
        }));
        
        console.log(LOG_MESSAGES.ACTION_FLOW_INITIALIZED, {
          street,
          firstPlayer: orderedPlayers[0]?.name,
          position: orderedPlayers[0]?.position,
          totalPlayers: orderedPlayers.length,
          pot: initialPot,
          currentBet: initialCurrentBet,
          lastRaiserIndex: street === StreetType.PREFLOP ? bbIndex : null
        });
      }
    }
  }, [orderedPlayers.length, street]);

  // Check if all remaining active players are all-in (no action needed)
  const areAllActivePlayersAllIn = (): boolean => {
    const activePlayers = orderedPlayers.filter(p => !actionState.foldedPlayers.has(p.id));
    const activeNonAllInPlayers = activePlayers.filter(p => !actionState.allInPlayers.has(p.id));
    
    console.log('🎰 Checking if all active players are all-in:', {
      totalPlayers: orderedPlayers.length,
      activePlayers: activePlayers.length,
      activeNonAllInPlayers: activeNonAllInPlayers.length,
      activePlayerNames: activePlayers.map(p => p.name),
      allInPlayerNames: Array.from(actionState.allInPlayers),
      foldedPlayerNames: Array.from(actionState.foldedPlayers),
      currentStreet: actionState.street
    });
    
    // Case 1: No players can act (all folded or all-in) - hand is over
    if (activeNonAllInPlayers.length === 0) {
      console.log('🏁 All active players are all-in - no action needed on this street');
      return true;
    }
    
    // Case 2: Only 1 active player remains (others folded) - hand is over  
    if (activePlayers.length === 1) {
      console.log('🏁 Only one active player remains - no action needed');
      return true;
    }
    
    // Case 3: Multiple active players but all are all-in - no action needed for rest of hand
    if (activePlayers.length > 1 && activeNonAllInPlayers.length === 0) {
      console.log('🏁 Multiple players active but all are all-in - no action needed for rest of hand');
      return true;
    }
    
    // Case 4: Big stack scenario - if only one player has chips but everyone else is all-in
    // Even though one player can "act", there's no one to bet against
    if (activeNonAllInPlayers.length === 1 && activePlayers.length > 1) {
      const otherActivePlayers = activePlayers.filter(p => !activeNonAllInPlayers.includes(p));
      const allOthersAllIn = otherActivePlayers.every(p => actionState.allInPlayers.has(p.id));
      
      if (allOthersAllIn) {
        console.log('🏁 Big stack has chips but all other players are all-in - no action needed', {
          bigStackPlayer: activeNonAllInPlayers[0].name,
          allInPlayers: otherActivePlayers.map(p => p.name)
        });
        return true;
      }
    }
    
    // Case 5: At least one player can still act AND there are others who can respond
    if (activeNonAllInPlayers.length > 0) {
      console.log('🎯 Players still need to act:', activeNonAllInPlayers.map(p => p.name));
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
      !actionState.allInPlayers.has(p.id)
    );
    
    console.log(LOG_MESSAGES.CHECKING_ROUND_COMPLETION, {
      currentPlayerIndex: actionState.currentPlayerIndex,
      lastRaiserIndex: actionState.lastRaiserIndex,
      totalPlayers: orderedPlayers.length,
      activePlayers: activePlayers.length,
      playersWhoCanAct: playersWhoCanAct.length,
      foldedPlayers: actionState.foldedPlayers.size,
      allInPlayers: actionState.allInPlayers.size,
      hasGoneAroundOnce: actionState.currentPlayerIndex >= orderedPlayers.length
    });
    
    // If only one active player remains, round is complete
    if (activePlayers.length <= GAME_STATE.ROUND_COMPLETE_THRESHOLD) {
      console.log('Round complete: only one active player remaining');
      return true;
    }
    
    // Special logic for all-in scenarios
    if (actionState.allInPlayers.size > 0) {
      console.log('🎰 ALL-IN scenario detected - checking if round complete');
      
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
      
      console.log('🎰 Players who need to respond to all-in:', {
        allInActionIndex,
        totalActions: actionState.actions.length,
        playersNeedingResponse: playersWhoNeedToRespondToAllIn.map(p => p.name),
        allActions: actionState.actions.map(a => `${a.playerId}: ${a.action}`)
      });
      
      if (playersWhoNeedToRespondToAllIn.length > 0) {
        console.log('Round not complete: players still need to respond to all-in', 
          playersWhoNeedToRespondToAllIn.map(p => p.name));
        return false;
      } else {
        console.log('Round complete: all players responded to all-in');
        return true;
      }
    }
    
    // Regular betting round logic (no all-ins)
    
    // If only one player can act and no all-ins, round is complete
    if (playersWhoCanAct.length <= GAME_STATE.ROUND_COMPLETE_THRESHOLD) {
      console.log('Round complete: only one player can act (no all-ins)');
      return true;
    }
    
    // If we haven't gone around the table once yet, continue
    if (actionState.currentPlayerIndex < orderedPlayers.length) {
      console.log('Round not complete: haven\'t gone around once');
      return false;
    }
    
    // If no one has raised (no lastRaiserIndex), round is complete after going around once
    if (actionState.lastRaiserIndex === null) {
      console.log('Round complete: no raises, gone around once');
      return true;
    }
    
    // Round is complete when we get back to the last raiser (but only after going around at least once)
    const adjustedIndex = actionState.currentPlayerIndex % orderedPlayers.length;
    const isBackToRaiser = adjustedIndex === actionState.lastRaiserIndex;
    console.log('Round complete check:', { isBackToRaiser, adjustedIndex, lastRaiserIndex: actionState.lastRaiserIndex });
    return isBackToRaiser;
  };

  // Get current player to act (skip folded and all-in players)
  const getCurrentPlayer = (): Player | null => {
    // First check if all active players are all-in (no action needed)
    if (areAllActivePlayersAllIn()) {
      console.log('🏁 All active players are all-in, no action needed');
      return null;
    }
    
    const roundComplete = isBettingRoundComplete();
    console.log('🔍 getCurrentPlayer called:', {
      roundComplete,
      currentPlayerIndex: actionState.currentPlayerIndex,
      foldedCount: actionState.foldedPlayers.size,
      allInCount: actionState.allInPlayers.size,
      totalPlayers: orderedPlayers.length
    });
    
    if (roundComplete) {
      console.log('🏁 Round marked as complete, returning null');
      return null; // Round complete
    }
    
    // Find the next active (non-folded, non-all-in) player starting from current index
    let searchIndex = actionState.currentPlayerIndex;
    const maxSearches = orderedPlayers.length * 2; // Prevent infinite loop
    
    for (let i = 0; i < maxSearches; i++) {
      const adjustedIndex = searchIndex % orderedPlayers.length;
      const player = orderedPlayers[adjustedIndex];
      
      console.log(`🔎 Checking player at index ${adjustedIndex}:`, {
        playerName: player?.name,
        isFolded: player ? actionState.foldedPlayers.has(player.id) : 'no player',
        isAllIn: player ? actionState.allInPlayers.has(player.id) : 'no player'
      });
      
      if (player && 
          !actionState.foldedPlayers.has(player.id) && 
          !actionState.allInPlayers.has(player.id)) {
        console.log(`✅ Found next player: ${player.name} at index ${adjustedIndex}`);
        return player;
      }
      
      searchIndex++;
    }
    
    console.log('❌ No active players found after search');
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
    if (!player) return [];

    const playerCurrentBet = actionState.playerBets.get(playerId) || 0;
    const amountToCall = Math.max(0, actionState.currentBet - playerCurrentBet);
    
    // Check if someone has gone all-in this round
    const hasAllInThisRound = actionState.allInPlayers.size > 0;
    
    // Calculate player's remaining stack
    const playerStackSize = player.stackSize?.[0] || DEFAULT_VALUES.STACK_SIZE;
    const remainingStack = playerStackSize - playerCurrentBet;
    
    console.log(`🎯 ACTION CALCULATION for ${player.name} (${player.position}):`, {
      currentBet: actionState.currentBet,
      playerCurrentBet,
      amountToCall,
      playerStackSize,
      remainingStack,
      street: actionState.street,
      actionsThisRound: actionState.actions.length,
      hasAllInThisRound,
      allInPlayersCount: actionState.allInPlayers.size
    });
    
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
    
    console.log(`✅ Available actions for ${player.name} (${player.position}):`, {
      actions,
      reasoning: hasAllInThisRound ? 'all-in-restricts-raises' : (actionState.currentBet === 0 ? 'no-active-bet' : (amountToCall > 0 ? 'money-owed' : 'already-matched')),
      stackConstraints: { remainingStack, amountToCall }
    });
    
    return actions;
  };

  // Execute action
  const executeAction = (playerId: string, action: ActionType, amount?: number): boolean => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer || currentPlayer.id !== playerId) {
      console.log('Not this player\'s turn:', { expected: currentPlayer?.id, actual: playerId });
      return false;
    }

    const playerCurrentBet = actionState.playerBets.get(playerId) || 0;
    const amountToCall = Math.max(0, actionState.currentBet - playerCurrentBet);
    
    console.log(LOG_MESSAGES.EXECUTING_ACTION, {
      player: currentPlayer.name,
      position: currentPlayer.position,
      action,
      amount,
      currentPot: actionState.pot,
      currentBet: actionState.currentBet,
      playerCurrentBet,
      amountToCall
    });

    let newPot = actionState.pot;
    let newCurrentBet = actionState.currentBet;
    let newLastRaiserIndex = actionState.lastRaiserIndex;
    const newPlayerBets = new Map(actionState.playerBets);
    
    switch (action) {
      case ActionType.FOLD:
        // Player will be added to folded players in the main state update below
        console.log(`${currentPlayer.name} ${LOG_MESSAGES.PLAYER_FOLDED}`);
        break;
        
      case ActionType.CHECK:
        if (amountToCall > 0) {
          console.log(VALIDATION_MESSAGES.CANNOT_CHECK_WITH_BET);
          return false;
        }
        break;
        
      case ActionType.CALL:
        if (amountToCall === 0) {
          console.log(VALIDATION_MESSAGES.CANNOT_CALL_WITHOUT_BET);
          return false;
        }
        
        // Check if player has enough stack to call
        const playerStackSize = currentPlayer.stackSize?.[0] || DEFAULT_VALUES.STACK_SIZE;
        const remainingStack = playerStackSize - playerCurrentBet;
        
        if (remainingStack < amountToCall) {
          console.log(`❌ CALL FAILED: Insufficient stack. Need ${amountToCall}, have ${remainingStack}`);
          return false;
        }
        
        newPot += amountToCall;
        newPlayerBets.set(playerId, playerCurrentBet + amountToCall);
        break;
        
      case ActionType.BET:
        if (actionState.currentBet > 0) {
          console.log(VALIDATION_MESSAGES.CANNOT_BET_WITH_EXISTING_BET);
          return false;
        }
        if (!amount || amount <= 0) {
          console.log(VALIDATION_MESSAGES.INVALID_BET_AMOUNT);
          return false;
        }
        newPot += amount;
        newCurrentBet = amount;
        newPlayerBets.set(playerId, amount);
        newLastRaiserIndex = actionState.currentPlayerIndex % orderedPlayers.length;
        break;
        
      case ActionType.RAISE:
        console.log(LOG_MESSAGES.RAISE_VALIDATION, {
          currentBet: actionState.currentBet,
          amount,
          amountType: typeof amount,
          isValidAmount: amount && amount > 0
        });
        if (actionState.currentBet === 0) {
          console.log(`❌ RAISE FAILED: ${VALIDATION_MESSAGES.CANNOT_RAISE_WITHOUT_BET}`);
          return false;
        }
        if (!amount || amount <= 0) {
          console.log(`❌ RAISE FAILED: ${VALIDATION_MESSAGES.INVALID_RAISE_AMOUNT}`);
          return false;
        }
        const totalRaiseAmount = amountToCall + amount;
        newPot += totalRaiseAmount;
        newCurrentBet = actionState.currentBet + amount; // Fix: new bet should be current bet + raise amount
        newPlayerBets.set(playerId, playerCurrentBet + totalRaiseAmount);
        newLastRaiserIndex = actionState.currentPlayerIndex % orderedPlayers.length;
        
        console.log(LOG_MESSAGES.RAISE_EXECUTED, {
          player: currentPlayer.name,
          position: currentPlayer.position,
          amountToCall,
          raiseAmount: amount,
          totalRaiseAmount,
          newCurrentBet,
          newLastRaiserIndex,
          currentPlayerIndex: actionState.currentPlayerIndex
        });
        break;
        
      case ActionType.ALL_IN:
        // Use player's actual stack size or default
        const allInPlayerStackSize = currentPlayer.stackSize?.[0] || DEFAULT_VALUES.STACK_SIZE;
        const allInAmount = allInPlayerStackSize - playerCurrentBet;
        
        if (allInAmount <= 0) {
          console.log(`❌ ALL-IN FAILED: Player has no remaining stack`);
          return false;
        }
        
        newPot += allInAmount;
        if (playerCurrentBet + allInAmount > actionState.currentBet) {
          newCurrentBet = playerCurrentBet + allInAmount;
          newLastRaiserIndex = actionState.currentPlayerIndex % orderedPlayers.length;
        }
        newPlayerBets.set(playerId, playerCurrentBet + allInAmount);
        console.log(`${currentPlayer.name} went all-in for ${allInAmount}`, {
          playerStackSize: allInPlayerStackSize,
          playerCurrentBet,
          allInAmount,
          newCurrentBet
        });
        break;
        
      default:
        console.log(VALIDATION_MESSAGES.INVALID_ACTION, action);
        return false;
    }

    // Record action
    const newAction = {
      playerId,
      action,
      amount: amount || 0
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
        
      const newState = {
        currentPlayerIndex: nextPlayerIndex,
        pot: newPot,
        currentBet: newCurrentBet,
        lastRaiserIndex: newLastRaiserIndex,
        actions: [...prev.actions, newAction],
        playerBets: newPlayerBets,
        street: prev.street, // Keep current street
        foldedPlayers: newFoldedPlayers, // Update folded players
        allInPlayers: newAllInPlayers // Update all-in players
      };
      
      console.log(`🎲 ${LOG_MESSAGES.STATE_UPDATE} for ${action}:`, {
        action,
        player: currentPlayer.name,
        position: currentPlayer.position,
        from: prev.currentPlayerIndex,
        to: nextPlayerIndex,
        pot: newPot,
        currentBet: newCurrentBet,
        lastRaiserIndex: newLastRaiserIndex,
        foldedPlayersCount: prev.foldedPlayers.size
      });
      
      // Add a small delay for debugging to ensure state is visible
      setTimeout(() => {
        console.log(`🎯 POST-UPDATE: Current player should now be index ${nextPlayerIndex}`);
        const nextPlayer = orderedPlayers[nextPlayerIndex % orderedPlayers.length];
        if (nextPlayer) {
          console.log(`🎯 Next player should be: ${nextPlayer.name} (${nextPlayer.position})`);
        }
      }, 50);
      
      return newState;
    });

    // Log the advancement (calculate next player before state update)
    const nextAdjustedIndex = nextPlayerIndex % orderedPlayers.length;
    const nextPlayer = orderedPlayers[nextAdjustedIndex];
    
    // Check if round will be complete after this advancement
    const willBeComplete = nextPlayerIndex >= orderedPlayers.length && 
                          (newLastRaiserIndex === null || nextAdjustedIndex === newLastRaiserIndex);
    
    if (nextPlayer && !willBeComplete) {
      console.log(LOG_MESSAGES.NEXT_PLAYER, {
        name: nextPlayer.name,
        position: nextPlayer.position,
        id: nextPlayer.id,
        nextPlayerIndex,
        adjustedIndex: nextAdjustedIndex,
        lastRaiserIndex: newLastRaiserIndex
      });
    } else {
      console.log(LOG_MESSAGES.ROUND_COMPLETE);
    }

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
    playerBets: actionState.playerBets
  };
};