
import { useGameStateUI } from '@/hooks/useGameStateUI';
import { GameState } from '@/utils/gameState';

interface PotDisplayProps {
  potSize: number;
  getCurrencySymbol: () => string;
  isFinal?: boolean;
  gameState?: GameState | null;
  pokerActions?: any;
}

const PotDisplay = ({ potSize, getCurrencySymbol, isFinal = false, gameState, pokerActions }: PotDisplayProps) => {
  const { potAmount } = useGameStateUI(gameState);
  
  // Use poker actions pot if available, otherwise use game state pot, otherwise fall back to calculated pot
  let displayPot = potSize;
  
  if (pokerActions?.getCurrentPot) {
    displayPot = pokerActions.getCurrentPot();
  } else if (gameState) {
    displayPot = potAmount;
  }
  
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
      <div className="text-center">
        <span className="text-slate-300">{isFinal ? 'Final' : 'Current'} Pot: </span>
        <span className="text-emerald-400 font-bold text-lg pot-display">
          {getCurrencySymbol()}{displayPot.toFixed(1)}
        </span>
      </div>
    </div>
  );
};

export default PotDisplay;
