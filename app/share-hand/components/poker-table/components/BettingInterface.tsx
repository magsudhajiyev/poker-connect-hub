'use client';


import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BetSizingButtons from '@/components/BetSizingButtons';
import { useDisplayValues } from '@/hooks/useDisplayValues';

interface BettingInterfaceProps {
  selectedAction: string;
  betAmount: string;
  setBetAmount: (amount: string) => void;
  potSize: number; // Should be in chips
  stackSize: number; // Should be in chips
  gameFormat?: string;
  formData?: any; // For display values
  onBetSizeButtonSelect: (amount: string) => void;
  onBetSubmit: () => void;
}

const BettingInterface = ({
  selectedAction,
  betAmount,
  setBetAmount,
  potSize,
  stackSize,
  gameFormat = 'cash',
  formData,
  onBetSizeButtonSelect,
  onBetSubmit,
}: BettingInterfaceProps) => {
  
  // Use display values for proper unit handling
  const displayValues = useDisplayValues({ 
    formData: formData || { gameFormat, smallBlind: '1', bigBlind: '2' }, 
  });
  
  const getBetSizeLabel = () => {
    const config = displayValues.getDisplayConfig();
    return `Bet Size (${config.symbol})`;
  };

  const handleBetSizeButtonSelect = (amountInChips: string) => {
    // No conversion needed - everything is in chips now
    onBetSizeButtonSelect(amountInChips);
  };

  if (selectedAction !== 'bet' && selectedAction !== 'raise') {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Quick Bet Sizes */}
      <div>
        <Label className="text-slate-300 text-xs">Quick Bet Sizes</Label>
        <div className="mt-1">
          <BetSizingButtons
            potSizeInChips={potSize}
            stackSizeInChips={stackSize}
            onBetSizeSelect={handleBetSizeButtonSelect}
            gameFormat={gameFormat}
            displayMode={displayValues.effectiveDisplayMode}
            bigBlind={displayValues.bigBlind}
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
            onClick={onBetSubmit}
            disabled={!betAmount || parseFloat(betAmount) <= 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BettingInterface;
