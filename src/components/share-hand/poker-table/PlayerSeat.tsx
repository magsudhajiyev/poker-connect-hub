
import React from 'react';
import { Player } from '@/types/shareHand';
import { useIsMobile } from '@/hooks/use-mobile';

interface PlayerSeatProps {
  player: Player;
  position: { x: number; y: number };
  isActive?: boolean;
  gameFormat?: string;
}

const PlayerSeat = ({ player, position, isActive = false, gameFormat = 'cash' }: PlayerSeatProps) => {
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

  console.log(`PlayerSeat rendering for ${player.name} at position:`, position);

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`
      }}
    >
      {/* Player Container */}
      <div className={`flex flex-col items-center space-y-1 ${isActive ? 'z-30' : 'z-20'}`}>
        {/* Player Avatar/Chip Stack */}
        <div 
          className={`${isMobile ? 'w-11 h-11' : 'w-16 h-16 sm:w-20 sm:h-20'} rounded-full border-3 flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 ${
            isActive 
              ? 'border-emerald-400 bg-emerald-500/30 shadow-lg shadow-emerald-400/50' 
              : player.isHero
                ? 'border-blue-400 bg-blue-500/30 shadow-md'
                : 'border-slate-300 bg-slate-600/40 shadow-md'
          }`}
        >
          {/* Player Name */}
          <div className={`${isMobile ? 'text-[7px]' : 'text-[9px] sm:text-[10px]'} font-medium text-center ${isMobile ? 'max-w-8' : 'max-w-12'} truncate ${
            isActive ? 'text-emerald-200' : player.isHero ? 'text-blue-200' : 'text-slate-100'
          }`}>
            {player.name}
          </div>

          {/* Stack Size */}
          <div className={`${isMobile ? 'text-[7px]' : 'text-[9px] sm:text-[10px]'} font-bold ${
            isActive ? 'text-emerald-200' : player.isHero ? 'text-blue-200' : 'text-slate-100'
          }`}>
            {gameFormat === 'cash' ? '$' : ''}{player.stackSize[0]}{gameFormat === 'mtt' ? 'BB' : ''}
          </div>
        </div>

        {/* Position Label */}
        <div className={`${isMobile ? 'text-[8px]' : 'text-xs'} text-slate-300 font-bold bg-slate-700/50 px-1 py-0.5 rounded`}>
          {getPositionLabel(player.position)}
        </div>

        {/* Active Player Indicator */}
        {isActive && (
          <div className={`absolute -top-1 -right-1 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'} bg-emerald-400 rounded-full animate-pulse shadow-lg border-2 border-emerald-200`} />
        )}
      </div>
    </div>
  );
};

export default PlayerSeat;
