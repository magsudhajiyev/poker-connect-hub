import React from 'react';
import { Player } from '@/types/shareHand';
import { cn } from '@/lib/utils';

// Move static data outside component to prevent recreation
const POSITION_LABELS: { [key: string]: string } = {
  utg: 'UTG',
  utg1: 'UTG+1',
  'utg+1': 'UTG+1',
  mp: 'MP',
  mp1: 'MP+1',
  'mp+1': 'MP+1',
  lj: 'LJ',
  hj: 'HJ',
  co: 'CO',
  btn: 'BTN',
  sb: 'SB',
  bb: 'BB',
};

const getPositionLabel = (position: string) => {
  const pos = position.toLowerCase();
  return POSITION_LABELS[pos] || position.toUpperCase();
};

interface PlayerSeatDisplayProps {
  player: Player;
  position: string;
  gameFormat?: string;
  isToAct?: boolean;
}

// Memoized component with custom comparison
const PlayerSeatDisplayOptimized = React.memo<PlayerSeatDisplayProps>(
  ({ player, position, isToAct = false }) => {
    const shouldShowPosition =
      position && position.toLowerCase() !== 'unknown' && position.toLowerCase() !== '';

    return (
      <div
        className={cn(
          'w-20 h-20 rounded-full flex flex-col items-center justify-center relative',
          'border-2 bg-gradient-to-br transition-all duration-300',
          isToAct
            ? 'border-emerald-500 from-emerald-900/40 to-emerald-800/30 shadow-emerald-500/20 shadow-lg animate-pulse'
            : (player as any).hasFolded
              ? 'border-slate-700 from-slate-900/90 to-slate-800/90 opacity-60'
              : 'border-slate-700 from-slate-900 to-slate-800',
        )}
      >
        <p
          className={cn(
            'text-sm font-semibold text-center',
            (player as any).hasFolded ? 'text-slate-500' : 'text-slate-200',
          )}
        >
          {player.name}
        </p>
        <span
          className={cn(
            'text-xs mt-1',
            (player as any).hasFolded ? 'text-slate-600' : 'text-slate-400',
          )}
        >
          {(player as any).isAllIn
            ? 'All-in'
            : `$${player.stackSize?.[0] || player.stackSize || 0}`}
        </span>
        {shouldShowPosition && (
          <span className="text-xs text-emerald-400 font-medium absolute -bottom-5">
            {getPositionLabel(position)}
          </span>
        )}
        {isToAct && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
        )}
        {(player as any).betAmount > 0 && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <span className="text-xs font-medium px-2 py-1 bg-slate-800/80 rounded-full text-amber-400 whitespace-nowrap">
              ${(player as any).betAmount}
            </span>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for better performance
    return (
      prevProps.player.id === nextProps.player.id &&
      (prevProps.player as any).stack === (nextProps.player as any).stack &&
      (prevProps.player as any).betAmount === (nextProps.player as any).betAmount &&
      (prevProps.player as any).hasFolded === (nextProps.player as any).hasFolded &&
      (prevProps.player as any).isAllIn === (nextProps.player as any).isAllIn &&
      prevProps.position === nextProps.position &&
      prevProps.isToAct === nextProps.isToAct
    );
  },
);

PlayerSeatDisplayOptimized.displayName = 'PlayerSeatDisplayOptimized';

export { PlayerSeatDisplayOptimized };
