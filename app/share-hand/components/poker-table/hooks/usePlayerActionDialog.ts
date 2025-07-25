import { useState, useEffect } from 'react';
import { Player } from '@/types/shareHand';

interface UsePlayerActionDialogProps {
  isOpen: boolean;
  player: Player;
  currentStreet: string;
  formData: any;
  pokerActions?: any;
  getAvailableActions?: (street: string, index: number, allActions: any[]) => string[];
  _getAvailableActions?: (street: string, index: number, allActions: any[]) => string[];
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

    const actionIndex = actions.findIndex(
      (action: any) => action.playerId === player.id && !action.completed,
    );

    return actionIndex;
  };

  const actionIndex = getCurrentActionIndex();
  const actions = formData?.[currentStreet] || [];

  // Get available actions from poker game engine if available and player is to act
  let availableActions: string[] = [];

  // First, try using the getAvailableActions prop if provided
  if (getAvailableActions && actionIndex >= 0) {
    availableActions = getAvailableActions(currentStreet, actionIndex, actions);
  } else if (pokerActions && pokerActions.isPlayerToAct && pokerActions.isPlayerToAct(player.id)) {
    // Then try pokerActions if available
    const validActions = pokerActions.getAvailableActions(player.id);
    availableActions = validActions;
  } else {
    // Fallback: determine actions based on game state
    const street = currentStreet?.replace('Actions', '') || 'preflop';
    if (street === 'preflop') {
      if (player.position === 'bb') {
        // Check if anyone has raised by looking at previous actions
        const hasRaise = actions.some(
          (action: any) =>
            action.completed &&
            (action.action === 'raise' ||
              (action.action === 'bet' &&
                parseFloat(action.amount) > parseFloat(formData?.bigBlind || '2'))),
        );

        if (hasRaise) {
          // BB facing a raise: can fold, call, or re-raise
          availableActions = ['fold', 'call', 'raise', 'all-in'];
        } else {
          // BB with no raise: can check or raise
          availableActions = ['check', 'raise', 'all-in'];
        }
      } else {
        // All other positions must call the BB or any raises
        availableActions = ['fold', 'call', 'raise', 'all-in'];
      }
    } else {
      // Post-flop: check if there's a bet
      const hasBet = actions.some(
        (action: any) => action.completed && (action.action === 'bet' || action.action === 'raise'),
      );

      if (hasBet) {
        availableActions = ['fold', 'call', 'raise', 'all-in'];
      } else {
        availableActions = ['fold', 'check', 'bet', 'all-in'];
      }
    }
  }

  const potSize =
    pokerActions?.pot ||
    (formData ? parseFloat(formData.smallBlind || '1') + parseFloat(formData.bigBlind || '2') : 3);

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
