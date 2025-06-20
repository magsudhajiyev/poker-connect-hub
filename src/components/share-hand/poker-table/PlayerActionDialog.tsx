import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Player } from '@/types/shareHand';
import { usePlayerActionDialog } from './hooks/usePlayerActionDialog';
import ActionSelectionButtons from './components/ActionSelectionButtons';
import BettingInterface from './components/BettingInterface';
import { ActionType, requiresBetAmount } from '@/constants';

interface PlayerActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player;
  position: string;
  currentStreet: string;
  formData: any;
  pokerActions?: any;
  getAvailableActions?: (street: string, index: number, allActions: any[]) => ActionType[];
  updateAction?: (street: any, index: number, action: ActionType, betAmount?: string) => void;
  handleBetSizeSelect?: (street: any, index: number, amount: string) => void;
}

const PlayerActionDialog = ({
  isOpen,
  onOpenChange,
  player,
  position,
  currentStreet,
  formData,
  pokerActions,
  getAvailableActions,
  updateAction,
  handleBetSizeSelect
}: PlayerActionDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset submitting state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);
  
  const {
    selectedAction,
    setSelectedAction,
    betAmount,
    setBetAmount,
    actionIndex,
    availableActions,
    potSize,
    stackSize
  } = usePlayerActionDialog({
    isOpen,
    player,
    currentStreet,
    formData,
    pokerActions,
    getAvailableActions
  });

  const handleActionSelect = (action: ActionType) => {
    console.log('🎯 handleActionSelect called:', action, Date.now());
    
    // Prevent action if already submitting
    if (isSubmitting) {
      console.log('⚠️ Already submitting, ignoring action select');
      return;
    }
    
    setSelectedAction(action);
    
    // For actions that don't require bet amount, submit immediately
    // bet and raise require amount input, so don't submit immediately
    if (!requiresBetAmount(action)) {
      console.log('🚀 Submitting action immediately:', action);
      submitAction(action);
    }
  };

  const handleBetSizeButtonSelect = (amount: string) => {
    setBetAmount(amount);
    
    // Use a valid index - if actionIndex is -1, use 0 as fallback
    const validIndex = actionIndex >= 0 ? actionIndex : 0;
    
    // If we have pokerActions (action flow system), always use submitAction
    // to ensure both form data AND action flow are updated
    if (pokerActions && pokerActions.executeAction) {
      submitAction(selectedAction, amount);
    } else if (handleBetSizeSelect) {
      handleBetSizeSelect(currentStreet, validIndex, amount);
      onOpenChange(false);
    } else {
      // If no handleBetSizeSelect function, just submit the bet action
      submitAction(selectedAction, amount);
    }
  };

  const submitAction = (action: ActionType, amount?: string) => {
    // Prevent double-click submissions
    if (isSubmitting) {
      console.log('⚠️ Action already submitting, ignoring duplicate request');
      return;
    }
    
    setIsSubmitting(true);
    
    console.log('SUBMIT ACTION:', {
      action, 
      amount, 
      actionIndex, 
      currentStreet,
      player: player.name,
      position: player.position,
      timestamp: Date.now()
    });
    
    // PRIORITIZE action flow for proper game logic
    if (pokerActions && pokerActions.executeAction) {
      const numericAmount = amount ? parseFloat(amount) : 0;
      const success = pokerActions.executeAction(player.id, action, numericAmount);
      
      if (success) {
        console.log('✓ Action flow updated successfully');
        
        // Add minimal delay to ensure state update is processed before closing dialog
        setTimeout(() => {
          onOpenChange(false);
          setIsSubmitting(false);
          console.log('🔄 Dialog closed after state update');
        }, 50); // Reduced from 100ms to 50ms for better responsiveness
        
      } else {
        console.log('❌ Action flow failed');
        setIsSubmitting(false);
        return; // Don't proceed if action flow fails
      }
    } else {
      // If no action flow, close immediately
      setIsSubmitting(false);
      onOpenChange(false);
    }
    
    // ALSO try to update form data for UI consistency (but don't fail if this fails)
    if (updateAction) {
      try {
        const validIndex = actionIndex >= 0 ? actionIndex : 0;
        updateAction(currentStreet, validIndex, action, amount || betAmount);
        console.log('✓ Form data also updated');
      } catch (error) {
        console.log('⚠ Form data update failed, but action flow succeeded:', error);
      }
    }
  };

  const handleBetSubmit = () => {
    if (isSubmitting) {
      console.log('⚠️ Bet submit already in progress, ignoring');
      return;
    }
    
    if (selectedAction && requiresBetAmount(selectedAction as ActionType)) {
      if (!betAmount || parseFloat(betAmount) <= 0) {
        alert('Please enter a valid bet amount');
        return;
      }
      submitAction(selectedAction as ActionType, betAmount);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-200">
            {player.name} Action ({position.toUpperCase()})
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Choose an action for this player
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Available Actions */}
          <ActionSelectionButtons
            availableActions={availableActions}
            selectedAction={selectedAction}
            onActionSelect={handleActionSelect}
            position={player.position}
            street={currentStreet}
          />

          {/* Betting Interface */}
          <BettingInterface
            selectedAction={selectedAction}
            betAmount={betAmount}
            setBetAmount={setBetAmount}
            potSize={potSize}
            stackSize={stackSize}
            gameFormat={formData?.gameFormat}
            onBetSizeButtonSelect={handleBetSizeButtonSelect}
            onBetSubmit={handleBetSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerActionDialog;