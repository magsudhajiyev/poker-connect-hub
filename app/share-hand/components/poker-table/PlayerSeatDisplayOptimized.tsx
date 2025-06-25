import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
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
    const avatarUrl = `https://avatar.iran.liara.run/public/${(parseInt(player.id.replace(/\D/g, '')) % 100) + 1}`;

    const shouldShowPosition =
      position && position.toLowerCase() !== 'unknown' && position.toLowerCase() !== '';

    return (
      <Card
        className={cn(
          'border border-slate-700 bg-gradient-to-br transition-all duration-300',
          isToAct
            ? 'from-emerald-900/40 to-emerald-800/30 shadow-emerald-500/20 shadow-lg animate-pulse ring-2 ring-emerald-500/50'
            : player.hasFolded
              ? 'from-slate-900/90 to-slate-800/90 opacity-60'
              : 'from-slate-900 to-slate-800',
        )}
      >
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={player.name}
                className={cn('w-12 h-12 rounded-full', player.hasFolded && 'grayscale opacity-60')}
              />
              {isToAct && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p
                  className={cn(
                    'text-sm font-semibold truncate',
                    player.hasFolded ? 'text-slate-500' : 'text-slate-200',
                  )}
                >
                  {player.name}
                </p>
                {isToAct && <ChevronRight className="w-3 h-3 text-emerald-400 animate-pulse" />}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={cn(player.hasFolded ? 'text-slate-600' : 'text-slate-400')}>
                  {player.isAllIn ? 'All-in' : `$${player.stack}`}
                </span>
                {shouldShowPosition && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-emerald-400 font-medium">
                      {getPositionLabel(position)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          {player.betAmount > 0 && (
            <div className="mt-2 text-center">
              <span className="text-xs font-medium px-2 py-1 bg-slate-800/80 rounded-full text-amber-400">
                ${player.betAmount}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for better performance
    return (
      prevProps.player.id === nextProps.player.id &&
      prevProps.player.stack === nextProps.player.stack &&
      prevProps.player.betAmount === nextProps.player.betAmount &&
      prevProps.player.hasFolded === nextProps.player.hasFolded &&
      prevProps.player.isAllIn === nextProps.player.isAllIn &&
      prevProps.position === nextProps.position &&
      prevProps.isToAct === nextProps.isToAct
    );
  },
);

PlayerSeatDisplayOptimized.displayName = 'PlayerSeatDisplayOptimized';

export { PlayerSeatDisplayOptimized };
