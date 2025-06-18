
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BetSizingButtons from '@/components/BetSizingButtons';

interface BettingInterfaceProps {
  selectedAction: string;
  betAmount: string;
  setBetAmount: (amount: string) => void;
  potSize: number;
  stackSize: number;
  gameFormat?: string;
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
  onBetSizeButtonSelect,
  onBetSubmit
}: BettingInterfaceProps) => {
  const getBetSizeLabel = () => {
    return gameFormat === 'cash' ? 'Bet Size ($)' : 'Bet Size (BB)';
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
            potSize={potSize}
            stackSize={stackSize}
            onBetSizeSelect={onBetSizeButtonSelect}
            gameFormat={gameFormat}
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
