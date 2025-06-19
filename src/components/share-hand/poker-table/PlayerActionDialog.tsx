
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Player } from '@/types/shareHand';
import { usePlayerActionDialog } from './hooks/usePlayerActionDialog';
import ActionSelectionButtons from './components/ActionSelectionButtons';
import BettingInterface from './components/BettingInterface';

interface PlayerActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player;
  position: string;
  currentStreet: string;
  formData: any;
  pokerActions?: any;
  getAvailableActions?: (street: string, index: number, allActions: any[]) => string[];
  updateAction?: (street: any, index: number, action: string, betAmount?: string) => void;
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

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    
    // For actions that don't require bet amount, submit immediately
    if (action !== 'raise') {
      submitAction(action);
    }
  };

  const handleBetSizeButtonSelect = (amount: string) => {
    setBetAmount(amount);
    
    // Use a valid index - if actionIndex is -1, use 0 as fallback
    const validIndex = actionIndex >= 0 ? actionIndex : 0;
    
    if (handleBetSizeSelect) {
      handleBetSizeSelect(currentStreet, validIndex, amount);
      onOpenChange(false);
    } else {
      // If no handleBetSizeSelect function, just submit the bet action
      submitAction(selectedAction, amount);
    }
  };

  const submitAction = (action: string, amount?: string) => {
    console.log('Submitting action:', { action, amount, actionIndex, currentStreet });
    
    // First, try to execute action through poker game engine
    if (pokerActions && pokerActions.executeAction) {
      const numericAmount = amount ? parseFloat(amount) : 0;
      const success = pokerActions.executeAction(action, numericAmount);
      
      if (success) {
        console.log('Action executed successfully through poker game engine');
        onOpenChange(false);
        return;
      } else {
        console.warn('Failed to execute action through poker game engine');
      }
    }
    
    // Fall back to form data update if poker game engine isn't available
    if (updateAction) {
      const validIndex = actionIndex >= 0 ? actionIndex : 0;
      updateAction(currentStreet, validIndex, action, amount || betAmount);
      onOpenChange(false);
    } else {
      console.log('No updateAction function available');
      onOpenChange(false);
    }
  };

  const handleBetSubmit = () => {
    if (selectedAction && selectedAction === 'raise') {
      if (!betAmount || parseFloat(betAmount) <= 0) {
        alert('Please enter a valid bet amount');
        return;
      }
      submitAction(selectedAction, betAmount);
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
