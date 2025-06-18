
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
    getAvailableActions
  });

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    
    // For actions that don't require bet amount, submit immediately
    if (action !== 'bet' && action !== 'raise') {
      submitAction(action);
    }
  };

  const handleBetSizeButtonSelect = (amount: string) => {
    setBetAmount(amount);
    if (handleBetSizeSelect && actionIndex >= 0) {
      handleBetSizeSelect(currentStreet, actionIndex, amount);
      onOpenChange(false);
    } else {
      // If no handleBetSizeSelect function, just submit the bet action
      submitAction(selectedAction, amount);
    }
  };

  const submitAction = (action: string, amount?: string) => {
    console.log('Submitting action:', { action, amount, actionIndex, currentStreet });
    
    if (updateAction) {
      // Use actionIndex if valid, otherwise use 0 as fallback
      const indexToUse = actionIndex >= 0 ? actionIndex : 0;
      updateAction(currentStreet, indexToUse, action, amount || betAmount);
      onOpenChange(false);
    } else {
      console.log('No updateAction function available');
      // Close dialog even if no updateAction function
      onOpenChange(false);
    }
  };

  const handleBetSubmit = () => {
    if (selectedAction && (selectedAction === 'bet' || selectedAction === 'raise')) {
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
