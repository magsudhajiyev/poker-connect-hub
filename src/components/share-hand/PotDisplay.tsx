
import { useGameStateUI } from '@/hooks/useGameStateUI';
import { GameState } from '@/utils/gameState';

interface PotDisplayProps {
  potSize: number;
  getCurrencySymbol: () => string;
  isFinal?: boolean;
  gameState?: GameState | null;
}

const PotDisplay = ({ potSize, getCurrencySymbol, isFinal = false, gameState }: PotDisplayProps) => {
  const { potAmount } = useGameStateUI(gameState);
  
  // Use game state pot if available, otherwise fall back to calculated pot
  const displayPot = gameState ? potAmount : potSize;
  
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
