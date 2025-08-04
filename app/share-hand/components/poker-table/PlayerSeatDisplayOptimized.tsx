import React from 'react';
import { Player } from '@/types/shareHand';
import { cn } from '@/lib/utils';
import { getPositionName } from '@/utils/shareHandConstants';
import { CardFromString } from '@/components/ui/playing-card';
import { usePokerHandStore } from '@/stores/poker-hand-store';

interface PlayerSeatDisplayProps {
  player: Player & { holeCards?: string[] };
  position: string;
  gameFormat?: string;
  isToAct?: boolean;
}

// Memoized component with custom comparison
const PlayerSeatDisplayOptimized = React.memo<PlayerSeatDisplayProps>(
  ({ player, position, isToAct = false }) => {
    // Subscribe to engine state changes - this ensures re-render when state updates
    const engineState = usePokerHandStore(state => state.engineState);
    
    // Get the actual stack from engine state
    let stackValue = 0;
    if (engineState?.currentState?.players) {
      // Handle both Map and plain object formats
      let enginePlayer;
      if (engineState.currentState.players instanceof Map) {
        enginePlayer = engineState.currentState.players.get(player.id);
      } else {
        // It's a plain object from JSON
        enginePlayer = engineState.currentState.players[player.id];
      }
      
      if (enginePlayer && typeof enginePlayer.stackSize === 'number') {
        stackValue = enginePlayer.stackSize;
      } else {
        // Fallback to player prop
        stackValue = Array.isArray(player.stackSize) ? player.stackSize[0] : (player.stackSize || 0);
      }
    } else {
      // No engine state, use player prop
      stackValue = Array.isArray(player.stackSize) ? player.stackSize[0] : (player.stackSize || 0);
    }
    
    // Get player status and bet from engine
    let hasFolded = false;
    let isAllIn = false;
    let betAmount = 0;
    
    if (engineState?.currentState?.players) {
      // Use the same enginePlayer we already fetched
      let enginePlayer;
      if (engineState.currentState.players instanceof Map) {
        enginePlayer = engineState.currentState.players.get(player.id);
      } else {
        enginePlayer = engineState.currentState.players[player.id];
      }
      
      if (enginePlayer) {
        hasFolded = enginePlayer.status === 'folded';
        isAllIn = enginePlayer.status === 'allIn';
        betAmount = enginePlayer.currentBet || 0;
      }
    } else {
      // Fallback to player props
      hasFolded = (player as any).hasFolded || false;
      isAllIn = (player as any).isAllIn || false;
      betAmount = (player as any).betAmount || 0;
    }
    
    const shouldShowPosition =
      position && position.toLowerCase() !== 'unknown' && position.toLowerCase() !== '';

    return (
      <div
        className={cn(
          'w-20 h-20 rounded-full flex flex-col items-center justify-center relative',
          'border-2 bg-gradient-to-br transition-all duration-300',
          isToAct
            ? 'border-emerald-500 from-emerald-900/40 to-emerald-800/30 shadow-emerald-500/20 shadow-lg animate-pulse'
            : hasFolded
              ? 'border-slate-700 from-slate-900/90 to-slate-800/90 opacity-60'
              : 'border-slate-700 from-slate-900 to-slate-800',
        )}
      >
        <p
          className={cn(
            'text-sm font-semibold text-center',
            hasFolded ? 'text-slate-500' : 'text-slate-200',
          )}
        >
          {player.name}
        </p>
        <span
          className={cn(
            'text-xs mt-1',
            hasFolded ? 'text-slate-600' : 'text-slate-400',
          )}
        >
          {isAllIn
            ? 'All-in'
            : `$${stackValue}`}
        </span>
        {shouldShowPosition && (
          <span className="text-xs text-emerald-400 font-medium absolute -bottom-5">
            {getPositionName(position)}
          </span>
        )}
        {isToAct && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
        )}
        {betAmount > 0 && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <span className="text-xs font-medium px-2 py-1 bg-slate-800/80 rounded-full text-amber-400 whitespace-nowrap">
              ${betAmount}
            </span>
          </div>
        )}
        {/* Hole cards display for hero player */}
        {player.isHero && player.holeCards && player.holeCards.length > 0 && (
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex gap-1">
            {player.holeCards.map((card, index) => (
              <CardFromString
                key={index}
                card={card}
                size="xs"
                className="shadow-lg"
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

PlayerSeatDisplayOptimized.displayName = 'PlayerSeatDisplayOptimized';

export { PlayerSeatDisplayOptimized };
