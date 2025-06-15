
import React from 'react';
import { Crown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Player } from '@/types/shareHand';

interface PlayerSeatDisplayProps {
  player: Player;
  position: string;
  gameFormat: string;
  isToAct?: boolean;
}

const PlayerSeatDisplay = ({ player, position, gameFormat, isToAct = false }: PlayerSeatDisplayProps) => {
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
        className={`${isMobile ? 'w-11 h-11' : 'w-16 h-16 sm:w-20 sm:h-20'} rounded-full border-3 flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 hover:scale-105 relative ${
          isToAct
            ? 'border-emerald-400 bg-emerald-500/30 shadow-lg shadow-emerald-400/50 animate-pulse'
            : player.isHero
            ? 'border-blue-400 bg-blue-500/30 shadow-md'
            : 'border-slate-300 bg-slate-600/40 shadow-md'
        }`}
      >
        {/* Hero Crown */}
        {player.isHero && (
          <Crown className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'} text-yellow-400 mb-0.5`} />
        )}
        
        {/* Player Name */}
        <div className={`${isMobile ? 'text-[7px]' : 'text-[9px] sm:text-[10px]'} font-medium text-center ${isMobile ? 'max-w-8' : 'max-w-12'} truncate ${
          isToAct ? 'text-emerald-200' : player.isHero ? 'text-blue-200' : 'text-slate-100'
        }`}>
          {player.name}
        </div>
        
        {/* Stack Size */}
        <div className={`${isMobile ? 'text-[7px]' : 'text-[9px] sm:text-[10px]'} font-bold ${
          isToAct ? 'text-emerald-200' : player.isHero ? 'text-blue-200' : 'text-slate-100'
        }`}>
          {gameFormat === 'cash' ? '$' : ''}{player.stackSize[0]}{gameFormat === 'mtt' ? 'BB' : ''}
        </div>

        {/* Action Indicator */}
        {isToAct && (
          <div className={`absolute -top-1 -right-1 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'} bg-emerald-400 rounded-full animate-pulse shadow-lg border-2 border-emerald-200`} />
        )}
      </div>

      {/* Position Label */}
      <div className={`${isMobile ? 'text-[8px]' : 'text-xs'} text-slate-300 font-bold bg-slate-700/50 px-1 py-0.5 rounded ${
        isToAct ? 'text-emerald-300 bg-emerald-900/50' : ''
      }`}>
        {getPositionLabel(position)}
      </div>
    </div>
  );
};

export default PlayerSeatDisplay;
