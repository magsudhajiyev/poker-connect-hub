
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
    <span className="pot-display">
      {displayPot}
    </span>
  );
};

export default PotDisplay;
