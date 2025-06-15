
import React from 'react';
import { Player } from '@/types/shareHand';

interface PlayerSeatProps {
  player: Player;
  position: { x: number; y: number };
  isActive?: boolean;
  gameFormat?: string;
}

const PlayerSeat = ({ player, position, isActive = false, gameFormat = 'cash' }: PlayerSeatProps) => {
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
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`
      }}
    >
      {/* Player Container */}
      <div className={`flex flex-col items-center space-y-1 ${isActive ? 'z-10' : 'z-0'}`}>
        {/* Player Avatar/Chip Stack */}
        <div 
          className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 ${
            isActive 
              ? 'border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-400/30' 
              : player.isHero
                ? 'border-blue-400 bg-blue-500/20'
                : 'border-slate-400 bg-slate-500/20'
          }`}
        >
          {/* Stack Size */}
          <div className={`text-[10px] sm:text-xs font-bold ${
            isActive ? 'text-emerald-300' : player.isHero ? 'text-blue-300' : 'text-slate-300'
          }`}>
            {gameFormat === 'cash' ? '$' : ''}{player.stackSize[0]}{gameFormat === 'mtt' ? 'BB' : ''}
          </div>
        </div>

        {/* Player Info */}
        <div className="flex flex-col items-center space-y-0.5">
          {/* Player Name */}
          <div className={`text-xs sm:text-sm font-medium px-2 py-0.5 rounded text-center max-w-20 truncate ${
            player.isHero ? 'text-blue-300' : 'text-slate-200'
          }`}>
            {player.name}
          </div>
          
          {/* Position Label */}
          <div className="text-[10px] text-slate-400 font-medium">
            {getPositionLabel(player.position)}
          </div>
        </div>

        {/* Active Player Indicator */}
        {isActive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg" />
        )}
      </div>
    </div>
  );
};

export default PlayerSeat;
