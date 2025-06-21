
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BetSizingButtons from '@/components/BetSizingButtons';

interface BetInputSectionProps {
  actionStep: any;
  index: number;
  street: string;
  formData: any;
  potSize: number;
  currentStackSize: number;
  handleBetInputChange: (actionStep: any, index: number, value: string) => void;
  handleBetSizeSelect: (street: any, index: number, amount: string) => void;
}

export const BetInputSection = ({
  actionStep,
  index,
  street,
  formData,
  potSize,
  currentStackSize,
  handleBetInputChange,
  handleBetSizeSelect,
}: BetInputSectionProps) => {
  const getBetSizeLabel = () => {
    return formData.gameFormat === 'cash' ? 'Bet Size ($)' : 'Bet Size (BB)';
  };

  return (
    <div className="space-y-2 w-full">
      <div className="w-full overflow-x-hidden">
        <Label className="text-slate-300 text-xs">Quick Bet Sizes</Label>
        <div className="mt-1">
          <BetSizingButtons
            potSize={potSize}
            stackSize={currentStackSize}
            onBetSizeSelect={(amount) => handleBetSizeSelect(street, index, amount)}
            gameFormat={formData.gameFormat}
          />
        </div>
      </div>
      <div className="w-full">
        <Label className="text-slate-300 text-xs">{getBetSizeLabel()}</Label>
        <Input
          value={actionStep.betAmount || ''}
          onChange={(e) => handleBetInputChange(actionStep, index, e.target.value)}
          placeholder="2.5"
          className="bg-slate-900/50 border-slate-700/50 text-slate-200 text-xs h-8 mt-1 w-full bet-size-input"
          type="number"
          min="0"
          step="0.1"
        />
      </div>
    </div>
  );
};
