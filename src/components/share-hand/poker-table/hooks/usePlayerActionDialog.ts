
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
  
  // Get available actions from poker game engine if available and player is to act
  let availableActions: string[] = [];
  
  console.log('usePlayerActionDialog - determining available actions:', {
    playerId: player.id,
    playerName: player.name,
    hasPokerActions: !!pokerActions,
    hasEngine: !!pokerActions?.engine,
    isPlayerToAct: pokerActions?.isPlayerToAct?.(player.id)
  });
  
  if (pokerActions && pokerActions.engine && pokerActions.isPlayerToAct && pokerActions.isPlayerToAct(player.id)) {
    console.log('Getting actions from poker game engine for player:', player.name);
    const validActions = pokerActions.getValidActionsForPlayer(player.id);
    console.log('Valid actions from engine:', validActions);
    
    availableActions = validActions;
  } else if (getAvailableActions) {
    // Fall back to the original logic only if poker game engine doesn't indicate this player should act
    console.log('Using fallback getAvailableActions');
    availableActions = getAvailableActions(currentStreet, actionIndex >= 0 ? actionIndex : 0, actions);
    console.log('Fallback available actions:', availableActions);
  } else {
    // Final fallback - basic poker actions
    console.log('Using default actions as last resort');
    availableActions = ['fold', 'check', 'call', 'raise'];
  }
  
  console.log('Final available actions for player', player.name, ':', availableActions);
  
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
