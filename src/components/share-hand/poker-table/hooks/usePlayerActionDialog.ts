
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
  getAvailableActions,
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
      action.playerId === player.id && !action.completed,
    );
    
    return actionIndex;
  };

  const actionIndex = getCurrentActionIndex();
  const actions = formData?.[currentStreet] || [];
  
  // Get available actions from poker game engine if available and player is to act
  let availableActions: string[] = [];
  
  console.log('ACTION DIALOG DEBUG:', {
    playerId: player.id,
    position: player.position,
    hasActionFlow: Boolean(pokerActions),
    isPlayerToAct: pokerActions?.isPlayerToAct?.(player.id),
    currentPlayer: pokerActions?.currentPlayer?.name,
    currentPlayerPosition: pokerActions?.currentPlayer?.position,
    actionIndex,
  });
  
  // ALWAYS use action flow if available and this player can act
  if (pokerActions && pokerActions.isPlayerToAct && pokerActions.isPlayerToAct(player.id)) {
    const validActions = pokerActions.getAvailableActions(player.id);
    availableActions = validActions;
    console.log('Using action flow actions (player to act):', validActions);
  } else {
    // Fallback: determine actions based on game state
    const street = currentStreet?.replace('Actions', '') || 'preflop';
    if (street === 'preflop') {
      if (player.position === 'bb') {
        // BB can check if no one raised
        availableActions = ['fold', 'check', 'raise', 'all-in'];
      } else {
        // All other positions must call the BB
        availableActions = ['fold', 'call', 'raise', 'all-in'];
      }
    } else {
      // Post-flop: can check if no bet
      availableActions = ['fold', 'check', 'bet', 'all-in'];
    }
    console.log('Using fallback actions for', player.position, ':', availableActions);
  }
  
  const potSize = pokerActions?.pot || (formData ? (parseFloat(formData.smallBlind || '1') + parseFloat(formData.bigBlind || '2')) : 3);
  
  // FORCE FIX: If this is preflop and player is not BB, remove check option
  const street = currentStreet?.replace('Actions', '') || 'preflop';
  if (street === 'preflop' && player.position !== 'bb') {
    availableActions = availableActions.filter(action => action !== 'check');
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
    stackSize,
  };
};
