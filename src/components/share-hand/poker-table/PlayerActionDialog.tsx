
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Player } from '@/types/shareHand';
import BetSizingButtons from '@/components/BetSizingButtons';

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
    hasGetAvailableActions: !!getAvailableActions,
    hasUpdateAction: !!updateAction
  });
  
  const potSize = formData ? (parseFloat(formData.smallBlind || '1') + parseFloat(formData.bigBlind || '2')) : 3;
  const stackSize = player.stackSize[0];

  useEffect(() => {
    if (isOpen) {
      setSelectedAction('');
      setBetAmount('');
    }
  }, [isOpen]);

  const getActionButtonClass = (action: string, isSelected: boolean) => {
    const baseClass = "transition-colors border";
    if (isSelected) {
      return `${baseClass} bg-emerald-500 text-slate-900 border-emerald-500`;
    }
    
    switch (action) {
      case 'fold':
        return `${baseClass} border-red-500/50 text-red-300 hover:bg-red-500/20 bg-slate-800`;
      case 'call':
        return `${baseClass} border-blue-500/50 text-blue-300 hover:bg-blue-500/20 bg-slate-800`;
      case 'check':
        return `${baseClass} border-green-500/50 text-green-300 hover:bg-green-500/20 bg-slate-800`;
      case 'bet':
      case 'raise':
        return `${baseClass} border-orange-500/50 text-orange-300 hover:bg-orange-500/20 bg-slate-800`;
      default:
        return `${baseClass} border-slate-700/50 text-slate-300 hover:bg-slate-800/50 bg-slate-800`;
    }
  };

  const handleActionSelect = (action: string) => {
    console.log('Action selected:', action);
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

  const getBetSizeLabel = () => {
    return formData?.gameFormat === 'cash' ? 'Bet Size ($)' : 'Bet Size (BB)';
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
          <div>
            <Label className="text-slate-300 text-sm font-medium mb-3 block">Choose Action</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableActions.map((action) => (
                <Button
                  key={action}
                  size="sm"
                  onClick={() => handleActionSelect(action)}
                  className={getActionButtonClass(action, selectedAction === action)}
                >
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Betting Interface */}
          {(selectedAction === 'bet' || selectedAction === 'raise') && (
            <div className="space-y-3">
              {/* Quick Bet Sizes */}
              <div>
                <Label className="text-slate-300 text-xs">Quick Bet Sizes</Label>
                <div className="mt-1">
                  <BetSizingButtons
                    potSize={potSize}
                    stackSize={stackSize}
                    onBetSizeSelect={handleBetSizeButtonSelect}
                    gameFormat={formData?.gameFormat || 'cash'}
                  />
                </div>
              </div>

              {/* Manual Bet Input */}
              <div>
                <Label className="text-slate-300 text-xs">{getBetSizeLabel()}</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="bg-slate-800 border-slate-600 text-slate-200"
                    type="number"
                    min="0"
                    step="0.1"
                  />
                  <Button
                    onClick={handleBetSubmit}
                    disabled={!betAmount || parseFloat(betAmount) <= 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerActionDialog;
