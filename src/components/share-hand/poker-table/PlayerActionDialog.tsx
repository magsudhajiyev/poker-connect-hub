
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
    if (!formData || !currentStreet) return -1;
    
    const actions = formData[currentStreet];
    if (!actions || actions.length === 0) {
      // If no actions exist yet, this means we need to create the first action
      // Return 0 to indicate this should be the first action
      return 0;
    }
    
    return actions.findIndex((action: any) => 
      action.playerId === player.id && !action.completed
    );
  };

  const actionIndex = getCurrentActionIndex();
  const actions = formData?.[currentStreet] || [];
  
  // If no actions exist yet and this is the first action, use default available actions
  const availableActions = getAvailableActions ? 
    getAvailableActions(currentStreet, Math.max(0, actionIndex), actions) : 
    ['fold', 'call', 'raise']; // Default actions if no function provided
    
  const potSize = formData ? (parseFloat(formData.smallBlind) + parseFloat(formData.bigBlind)) : 0;
  const stackSize = player.stackSize[0];

  useEffect(() => {
    if (isOpen) {
      setSelectedAction('');
      setBetAmount('');
    }
  }, [isOpen]);

  const getActionButtonClass = (action: string, isSelected: boolean) => {
    const baseClass = "transition-colors";
    if (isSelected) {
      return `${baseClass} bg-emerald-500 text-slate-900`;
    }
    
    switch (action) {
      case 'fold':
        return `${baseClass} border-red-500/50 text-red-300 hover:bg-red-500/20`;
      case 'call':
        return `${baseClass} border-blue-500/50 text-blue-300 hover:bg-blue-500/20`;
      case 'check':
        return `${baseClass} border-green-500/50 text-green-300 hover:bg-green-500/20`;
      case 'bet':
      case 'raise':
        return `${baseClass} border-orange-500/50 text-orange-300 hover:bg-orange-500/20`;
      default:
        return `${baseClass} border-slate-700/50 text-slate-300 hover:bg-slate-800/50`;
    }
  };

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
      // Close dialog automatically after bet size selection
      setTimeout(() => {
        onOpenChange(false);
      }, 100);
    }
  };

  const submitAction = (action: string, amount?: string) => {
    if (updateAction && actionIndex >= 0) {
      console.log(`Submitting action: ${action} with amount: ${amount || betAmount} for player: ${player.name}`);
      updateAction(currentStreet, actionIndex, action, amount || betAmount);
      
      // Close dialog automatically after action submission
      setTimeout(() => {
        onOpenChange(false);
      }, 100);
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

  // Don't render if we can't determine a valid action index
  if (actionIndex < 0) {
    console.log('PlayerActionDialog: Invalid action index', { actionIndex, player: player.name, currentStreet });
    return null;
  }

  console.log('PlayerActionDialog rendering for:', { 
    playerName: player.name, 
    position, 
    actionIndex, 
    availableActions,
    isOpen 
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-200">
            {player.name} Action ({position.toUpperCase()})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Available Actions */}
          <div>
            <Label className="text-slate-300 text-sm">Choose Action</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
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
