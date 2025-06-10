
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Player, StreetType } from '@/types/shareHand';
import { useShareHandContext } from './ShareHandProvider';

interface ActionButtonsProps {
  player: Player;
  formData: any;
  setFormData: (data: any) => void;
  currentStep: number;
}

const ActionButtons = ({ player, formData, setFormData, currentStep }: ActionButtonsProps) => {
  const [betAmount, setBetAmount] = useState('');
  const { gameStateUI, getAvailableActions, updateAction } = useShareHandContext();
  
  const streetMap: { [key: number]: StreetType | '' } = {
    0: '',
    1: '',
    2: 'preflopActions',
    3: 'flopActions',
    4: 'turnActions',
    5: 'riverActions'
  };
  
  const street = streetMap[currentStep];
  
  if (!street) return null;
  
  const actions = formData[street] || [];
  const currentActionIndex = actions.findIndex((action: any) => 
    action.playerId === player.id && !action.completed
  );
  
  if (currentActionIndex === -1) return null;
  
  const availableActions = getAvailableActions(street, currentActionIndex, actions);
  
  const handleAction = (action: string) => {
    let amount = '';
    
    if (action === 'bet' || action === 'raise') {
      if (!betAmount || parseFloat(betAmount) <= 0) {
        alert('Please enter a valid bet amount');
        return;
      }
      amount = betAmount;
    }
    
    updateAction(street, currentActionIndex, action, amount);
    setBetAmount('');
  };

  return (
    <div className="space-y-2 min-w-[120px]">
      <div className="grid grid-cols-2 gap-1">
        {availableActions.map((action) => (
          <Button
            key={action}
            size="sm"
            onClick={() => handleAction(action)}
            className="h-6 text-xs"
            variant={action === 'fold' ? 'destructive' : 'default'}
          >
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </Button>
        ))}
      </div>
      
      {(availableActions.includes('bet') || availableActions.includes('raise')) && (
        <Input
          placeholder="Amount"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          className="h-6 text-xs"
          type="number"
          min="0"
          step="0.1"
        />
      )}
    </div>
  );
};

export default ActionButtons;
