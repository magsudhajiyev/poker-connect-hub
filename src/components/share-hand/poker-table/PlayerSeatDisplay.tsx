
import React from 'react';
import { Crown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Player } from '@/types/shareHand';

interface PlayerSeatDisplayProps {
  player: Player;
  position: string;
  gameFormat: string;
}

const PlayerSeatDisplay = ({ player, position, gameFormat }: PlayerSeatDisplayProps) => {
  const isMobile = useIsMobile();

  const getPositionLabel = (pos: string) => {
    const labels: { [key: string]: string } = {
      'utg': 'UTG',
      'utg1': 'UTG+1',
      'mp': 'MP',
      'lj': 'LJ',
      'hj': 'HJ',
      'co': 'CO',
      'btn': 'BTN',
      'sb': 'SB',
      'bb': 'BB'
    };
    return labels[pos] || pos.toUpperCase();
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      <div 
        className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20'} rounded-full border-3 flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 hover:scale-105 ${
          player.isHero
            ? 'border-blue-400 bg-blue-500/30 shadow-md'
            : 'border-slate-300 bg-slate-600/40 shadow-md'
        }`}
      >
        {/* Hero Crown */}
        {player.isHero && (
          <Crown className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-yellow-400 mb-1`} />
        )}
        
        {/* Stack Size */}
        <div className={`${isMobile ? 'text-[10px]' : 'text-xs sm:text-sm'} font-bold ${
          player.isHero ? 'text-blue-200' : 'text-slate-100'
        }`}>
          {gameFormat === 'cash' ? '$' : ''}{player.stackSize[0]}{gameFormat === 'mtt' ? 'BB' : ''}
        </div>
      </div>

      {/* Player Info */}
      <div className="flex flex-col items-center space-y-0.5">
        <div className={`${isMobile ? 'text-[11px]' : 'text-sm sm:text-base'} font-medium px-2 py-1 rounded bg-slate-800/80 text-center ${isMobile ? 'max-w-20' : 'max-w-24'} truncate border ${
          player.isHero ? 'text-blue-200 border-blue-400/30' : 'text-slate-100 border-slate-500/30'
        }`}>
          {player.name}
        </div>
        
        <div className={`${isMobile ? 'text-[9px]' : 'text-xs'} text-slate-300 font-bold bg-slate-700/50 px-1 py-0.5 rounded`}>
          {getPositionLabel(position)}
        </div>
      </div>
    </div>
  );
};

export default PlayerSeatDisplay;
