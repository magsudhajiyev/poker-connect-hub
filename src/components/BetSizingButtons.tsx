
import { Button } from '@/components/ui/button';

interface BetSizingButtonsProps {
  potSize: number;
  stackSize: number;
  onBetSizeSelect: (amount: string) => void;
  gameFormat: string;
}

const BetSizingButtons = ({ potSize, stackSize, onBetSizeSelect, gameFormat: _gameFormat }: BetSizingButtonsProps) => {
  const calculateBetSize = (percentage: number) => {
    if (percentage === 100) {
      // All in - return stack size
      return stackSize.toString();
    }
    
    // Calculate bet using the formula: bet = pot + pot * percentage
    const betAmount = potSize + (potSize * percentage / 100);
    return betAmount.toFixed(1);
  };

  const betSizes = [
    { label: '30%', percentage: 30 },
    { label: '50%', percentage: 50 },
    { label: '70%', percentage: 70 },
    { label: 'All in', percentage: 100 },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {betSizes.map((size) => (
        <Button
          key={size.label}
          variant="outline"
          size="sm"
          onClick={() => onBetSizeSelect(calculateBetSize(size.percentage))}
          className="border-slate-700/50 text-slate-300 hover:bg-slate-800/50"
        >
          {size.label}
        </Button>
      ))}
    </div>
  );
};

export default BetSizingButtons;
