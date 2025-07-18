import React, { useCallback } from 'react';
import { ShareHandFormData, StreetType } from '@/types/shareHand';
import { ActionType } from '@/constants';

export const useActionManagement = (
  _formData: ShareHandFormData,
  setFormData: React.Dispatch<React.SetStateAction<ShareHandFormData>>,
) => {
  const updateAction = (
    street: StreetType,
    index: number,
    action: ActionType,
    betAmount?: string,
  ) => {
    setFormData((prev: ShareHandFormData) => {
      const currentActions = prev[street] || [];
      const updatedActions = [...currentActions];
      const actionStep = updatedActions[index];

      if (actionStep) {
        updatedActions[index] = {
          ...actionStep,
          action,
          betAmount,
          completed: true,
        };
      }

      return {
        ...prev,
        [street]: updatedActions,
      };
    });
  };

  const handleBetSizeSelect = (street: StreetType, index: number, amount: string) => {
    // Validate amount is a valid number
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }

    setFormData((prev: ShareHandFormData) => {
      const updatedActions = [...prev[street]];

      // Add bounds checking
      if (index < 0 || index >= updatedActions.length) {
        return prev;
      }

      const currentAction = updatedActions[index];

      // Update the current action with bet amount and mark as completed
      updatedActions[index] = {
        ...currentAction,
        betAmount: amount,
        completed: true,
      };

      return { ...prev, [street]: updatedActions };
    });
  };

  const initializeActionsForPositions = useCallback(() => {
    // Simplified initialization - just maintain existing actions
    return;
  }, []);

  return {
    updateAction,
    handleBetSizeSelect,
    initializeActionsForPositions,
  };
};
