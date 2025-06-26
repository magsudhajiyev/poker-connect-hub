'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BetSizingButtons from '@/components/BetSizingButtons';
import { useDisplayValues } from '@/hooks/useDisplayValues';
import { calculatePotSize } from '@/utils/shareHandCalculations';

interface BetInputSectionProps {
  actionStep: any;
  index: number;
  street: string;
  formData: any;
  potSize?: number; // Optional - will be calculated if not provided
  currentStackSize: number; // Should be in chips
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
  // Use display values for proper unit handling
  const displayValues = useDisplayValues({ formData });

  // Calculate pot size in chips if not provided
  const potSizeInChips = potSize || calculatePotSize(formData, { returnInChips: true });

  // Format stack size for display
  const stackDisplay = displayValues.formatChipAmount(currentStackSize);

  // Get display configuration
  const displayConfig = displayValues.getDisplayConfig();

  const getBetSizeLabel = () => {
    return `Bet Size (${displayConfig.symbol})`;
  };

  const handleBetSizeButtonSelect = (amountInChips: string) => {
    // Convert chips back to display unit for the input
    const chipAmount = parseFloat(amountInChips);
    const displayAmount = displayValues.convertFromChips(chipAmount);
    handleBetSizeSelect(street, index, displayAmount.toString());
  };

  const validateAndFormatInput = (value: string) => {
    const chipAmount = displayValues.parseInputToChips(value);
    const validation = displayValues.validateBetAmount(chipAmount, currentStackSize);

    if (!validation.isValid && validation.error) {
      console.warn('Bet validation:', validation.error);
    }

    return value; // Return original value for now, validation can be added later
  };

  return (
    <div className="space-y-2 w-full">
      <div className="w-full overflow-x-hidden">
        <Label className="text-slate-300 text-xs">Quick Bet Sizes</Label>
        <div className="mt-1">
          {potSizeInChips > 0 && currentStackSize > 0 ? (
            <BetSizingButtons
              potSizeInChips={potSizeInChips}
              stackSizeInChips={currentStackSize}
              onBetSizeSelect={handleBetSizeButtonSelect}
              gameFormat={formData.gameFormat}
              displayMode={displayValues.effectiveDisplayMode}
              bigBlind={displayValues.bigBlind}
            />
          ) : (
            <div className="text-xs text-slate-400">
              Bet sizing unavailable (pot: {potSizeInChips}, stack: {currentStackSize})
            </div>
          )}
        </div>
      </div>
      <div className="w-full">
        <Label className="text-slate-300 text-xs">{getBetSizeLabel()}</Label>
        <div className="relative">
          <Input
            value={actionStep.betAmount || ''}
            onChange={(e) =>
              handleBetInputChange(actionStep, index, validateAndFormatInput(e.target.value))
            }
            placeholder={displayValues.effectiveDisplayMode === 'chips' ? '25.0' : '12.5'}
            className="bg-slate-900/50 border-slate-700/50 text-slate-200 text-xs h-8 mt-1 w-full bet-size-input"
            type="number"
            min="0"
            step={displayValues.effectiveDisplayMode === 'chips' ? '0.25' : '0.1'}
          />
          {/* Stack size indicator */}
          <div className="text-xs text-slate-400 mt-1">Stack: {stackDisplay.formatted}</div>
        </div>
      </div>
    </div>
  );
};
