
import { useGameStateUI } from '@/hooks/useGameStateUI';
import { useDisplayValues } from '@/hooks/useDisplayValues';
import { GameState } from '@/utils/gameState';
import { calculatePotSize } from '@/utils/shareHandCalculations';

interface PotDisplayProps {
  potSize?: number; // Optional - will be calculated if not provided
  formData?: any; // For display value calculations
  getCurrencySymbol?: () => string; // Optional - will be determined from display values
  isFinal?: boolean;
  gameState?: GameState | null;
  pokerActions?: any;
}

const PotDisplay = ({ 
  potSize, 
  formData, 
  getCurrencySymbol, 
  isFinal = false, 
  gameState, 
  pokerActions, 
}: PotDisplayProps) => {
  const { potAmount } = useGameStateUI(gameState);
  
  // Use display values for proper formatting
  const displayValues = formData ? useDisplayValues({ formData }) : null;
  
  // Calculate pot size in chips if not provided
  let potSizeInChips = potSize;
  if (!potSizeInChips && formData) {
    potSizeInChips = calculatePotSize(formData, { returnInChips: true });
  }
  
  // Use poker actions pot if available, otherwise use game state pot, otherwise fall back to calculated pot
  if (pokerActions?.pot !== undefined) {
    potSizeInChips = pokerActions.pot;
  } else if (gameState) {
    potSizeInChips = potAmount;
  }
  
  // Format pot for display
  let displayPot: string;
  if (displayValues && potSizeInChips !== undefined) {
    const potDisplay = displayValues.formatChipAmount(potSizeInChips);
    displayPot = potDisplay.formatted;
  } else {
    // Fallback to legacy format
    const symbol = getCurrencySymbol ? getCurrencySymbol() : '$';
    displayPot = `${symbol}${(potSizeInChips || 0).toFixed(1)}`;
  }
  
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
      <div className="text-center">
        <span className="text-slate-300">{isFinal ? 'Final' : 'Current'} Pot: </span>
        <span className="text-emerald-400 font-bold text-lg pot-display">
          {displayPot}
        </span>
        {formData && displayValues && (
          <div className="text-xs text-slate-400 mt-1">
            {displayValues.effectiveDisplayMode === 'chips' 
              ? `${displayValues.chipsToBlindBets(potSizeInChips || 0).toFixed(1)}BB`
              : `$${(potSizeInChips || 0).toFixed(2)}`
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default PotDisplay;
