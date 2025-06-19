
import { useState, useEffect } from 'react';
import { Player } from '@/types/shareHand';

interface UsePlayerActionDialogProps {
  isOpen: boolean;
  player: Player;
  currentStreet: string;
  formData: any;
  pokerActions?: any;
  getAvailableActions?: (street: string, index: number, allActions: any[]) => string[];
}

export const usePlayerActionDialog = ({
  isOpen,
  player,
  currentStreet,
  formData,
  pokerActions,
  getAvailableActions
}: UsePlayerActionDialogProps) => {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [betAmount, setBetAmount] = useState<string>('');

  // Get current action step for this player
  const getCurrentActionIndex = () => {
    if (!formData || !currentStreet) {
      return -1;
    }
    
    const actions = formData[currentStreet];
    if (!actions) {
      return -1;
    }
    
    const actionIndex = actions.findIndex((action: any) => 
      action.playerId === player.id && !action.completed
    );
    
    return actionIndex;
  };

  const actionIndex = getCurrentActionIndex();
  const actions = formData?.[currentStreet] || [];
  
  // Get available actions - debug which path we're taking
  let availableActions: string[] = [];
  let debugPath = '';
  
  console.log('DEBUG - Player action dialog:', {
    playerId: player.id,
    position: player.position,
    currentStreet,
    hasPokerActions: !!pokerActions,
    hasEngine: !!pokerActions?.engine,
    isPlayerToAct: pokerActions?.isPlayerToAct?.(player.id),
    hasGetAvailableActions: !!getAvailableActions,
    actionIndex
  });
  
  if (pokerActions && pokerActions.engine && pokerActions.isPlayerToAct && pokerActions.isPlayerToAct(player.id)) {
    const validActions = pokerActions.getValidActionsForPlayer(player.id);
    availableActions = validActions;
    debugPath = 'poker-engine';
  } else if (getAvailableActions) {
    // Fall back to the improved action logic
    availableActions = getAvailableActions(currentStreet, actionIndex >= 0 ? actionIndex : 0, actions);
    debugPath = 'getAvailableActions';
  } else {
    // Final fallback - need to determine proper actions based on street and situation
    const street = currentStreet?.replace('Actions', '') || 'preflop';
    if (street === 'preflop') {
      // Preflop - there's always a BB bet, so can't check (except BB in special cases)
      availableActions = ['fold', 'call', 'raise', 'all-in'];
    } else {
      // Post-flop - can check if no bet
      availableActions = ['fold', 'check', 'bet', 'all-in'];
    }
    debugPath = 'final-fallback';
  }
  
  console.log('DEBUG - Actions determined:', {
    path: debugPath,
    actions: availableActions,
    player: player.position
  });
  
  const potSize = formData ? (parseFloat(formData.smallBlind || '1') + parseFloat(formData.bigBlind || '2')) : 3;
  
  // FORCE FIX: If this is preflop and player is not BB, remove check option
  const street = currentStreet?.replace('Actions', '') || 'preflop';
  if (street === 'preflop' && player.position !== 'bb') {
    availableActions = availableActions.filter(action => action !== 'check');
    console.log('DEBUG - Removed check for non-BB preflop:', {
      position: player.position,
      finalActions: availableActions
    });
  }
  const stackSize = player.stackSize[0];

  useEffect(() => {
    if (isOpen) {
      setSelectedAction('');
      setBetAmount('');
    }
  }, [isOpen]);

  return {
    selectedAction,
    setSelectedAction,
    betAmount,
    setBetAmount,
    actionIndex,
    availableActions,
    potSize,
    stackSize
  };
};
