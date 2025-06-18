
import { useState, useEffect } from 'react';
import { Player } from '@/types/shareHand';

interface UsePlayerActionDialogProps {
  isOpen: boolean;
  player: Player;
  currentStreet: string;
  formData: any;
  getAvailableActions?: (street: string, index: number, allActions: any[]) => string[];
}

export const usePlayerActionDialog = ({
  isOpen,
  player,
  currentStreet,
  formData,
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
  
  // Always provide poker actions - make sure these are always available
  const defaultActions = ['fold', 'check', 'call', 'bet', 'raise'];
  let availableActions = defaultActions;
  
  // Only use getAvailableActions if it returns a non-empty array
  if (getAvailableActions) {
    const customActions = getAvailableActions(currentStreet, actionIndex >= 0 ? actionIndex : 0, actions);
    if (customActions && customActions.length > 0) {
      availableActions = customActions;
    }
  }
  
  console.log('PlayerActionDialog rendered:', {
    player: player.name,
    currentStreet,
    actionIndex,
    availableActions,
    hasGetAvailableActions: !!getAvailableActions
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
