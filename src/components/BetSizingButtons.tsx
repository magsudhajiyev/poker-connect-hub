
import { Button } from '@/components/ui/button';

interface BetSizingButtonsProps {
  potSizeInChips: number; // Always expect pot size in chips
  stackSizeInChips: number; // Always expect stack size in chips
  onBetSizeSelect: (amountInChips: string) => void;
  gameFormat: string;
  displayMode?: 'chips' | 'bb';
  bigBlind?: number;
}

const BetSizingButtons = ({ 
  potSizeInChips, 
  stackSizeInChips, 
  onBetSizeSelect, 
  gameFormat,
  displayMode,
  bigBlind = 2,
}: BetSizingButtonsProps) => {
  
  // Ensure we have valid numeric values
  const safePotSize = Math.max(0, Number(potSizeInChips) || 0);
  const safeStackSize = Math.max(0, Number(stackSizeInChips) || 0);
  const safeBigBlind = Math.max(0.1, Number(bigBlind) || 2);
  
  // Don't render if we don't have valid values
  if (safePotSize <= 0 || safeStackSize <= 0) {
    return (
      <div className="text-xs text-slate-400">
        Invalid pot ({safePotSize}) or stack ({safeStackSize}) size
      </div>
    );
  }
  
  // Determine display mode based on game format if not specified
  const effectiveDisplayMode = displayMode || (gameFormat === 'cash' ? 'chips' : 'bb');
  
  const calculateBetSizeInChips = (potPercentage: number): number => {
    if (potPercentage === 100) {
      // All in - return stack size
      return safeStackSize;
    }
    
    // Calculate bet as percentage of pot
    const betAmountInChips = safePotSize * (potPercentage / 100);
    return Math.min(betAmountInChips, safeStackSize); // Cap at stack size
  };

  const handleButtonClick = (percentage: number) => {
    const chipAmount = calculateBetSizeInChips(percentage);
    onBetSizeSelect(chipAmount.toString());
  };

  const formatBetLabel = (chipAmount: number, label: string): string => {
    if (label === 'All in') {
return label;
}
    
    if (effectiveDisplayMode === 'chips') {
      return `${label} ($${chipAmount.toFixed(1)})`;
    } else {
      const bbAmount = chipAmount / safeBigBlind;
      return `${label} (${bbAmount.toFixed(1)}BB)`;
    }
  };

  const betSizes = [
    { label: '1/3 Pot', percentage: 33.33 },
    { label: '1/2 Pot', percentage: 50 },
    { label: '3/4 Pot', percentage: 75 },
    { label: 'All in', percentage: 100 },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {betSizes.map((size) => {
        const chipAmount = calculateBetSizeInChips(size.percentage);
        const isAllIn = chipAmount >= safeStackSize;
        
        return (
          <Button
            key={size.label}
            variant="outline"
            size="sm"
            onClick={() => handleButtonClick(size.percentage)}
            className={`border-slate-700/50 text-slate-300 hover:bg-slate-800/50 text-xs ${
              isAllIn ? 'border-red-400/50 text-red-300' : ''
            }`}
            title={formatBetLabel(chipAmount, size.label)}
          >
            {size.label}
          </Button>
        );
      })}
    </div>
  );
};

export default BetSizingButtons;
