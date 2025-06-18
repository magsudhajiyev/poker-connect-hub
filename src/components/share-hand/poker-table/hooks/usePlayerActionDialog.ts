
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
  
  // Get available actions from poker algorithm if available and player is to act
  let availableActions: string[] = [];
  
  if (pokerActions && pokerActions.isPlayerToAct && pokerActions.isPlayerToAct(player.id)) {
    console.log('Getting actions from poker algorithm for player:', player.name);
    const validActions = pokerActions.getValidActionsForPlayer(player.id);
    availableActions = validActions.map((action: any) => action.type || action);
    console.log('Valid actions from algorithm:', availableActions);
  } else if (getAvailableActions) {
    // Fall back to the original logic only if poker algorithm doesn't indicate this player should act
    availableActions = getAvailableActions(currentStreet, actionIndex >= 0 ? actionIndex : 0, actions);
    console.log('Using fallback actions:', availableActions);
  } else {
    // Final fallback - basic poker actions
    availableActions = ['fold', 'check', 'call', 'bet', 'raise'];
    console.log('Using default actions as last resort');
  }
  
  console.log('PlayerActionDialog rendered:', {
    player: player.name,
    currentStreet,
    actionIndex,
    availableActions,
    isPlayerToAct: pokerActions?.isPlayerToAct?.(player.id),
    hasPokerActions: !!pokerActions
  });
  
  const potSize = formData ? (parseFloat(formData.smallBlind || '1') + parseFloat(formData.bigBlind || '2')) : 3;
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
