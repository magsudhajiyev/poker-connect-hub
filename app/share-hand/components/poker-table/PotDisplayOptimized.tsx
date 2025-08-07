import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { DollarSign } from 'lucide-react';

interface PotDisplayOptimizedProps {
  pot: number;
  sidePots?: Array<{ amount: number; eligiblePlayers: string[] }>;
  getCurrencySymbol?: () => string;
  displayValues?: {
    formatPotAmount: (amount: number) => { formatted: string };
  };
  className?: string;
}

const PotDisplayOptimized = React.memo<PotDisplayOptimizedProps>(
  ({ pot, sidePots, getCurrencySymbol, displayValues, className }) => {
    // Memoize pot display calculation
    const displayPot = useMemo(() => {
      if (displayValues) {
        const potDisplay = displayValues.formatPotAmount(pot);
        return potDisplay.formatted;
      }
      const symbol = getCurrencySymbol ? getCurrencySymbol() : '$';
      return `${symbol}${pot.toFixed(2)}`;
    }, [pot, displayValues, getCurrencySymbol]);

    // Memoize side pots display
    const sidePotDisplays = useMemo(() => {
      if (!sidePots || sidePots.length === 0) {
        return null;
      }

      return sidePots.map((sidePot, index) => {
        const display = displayValues
          ? displayValues.formatPotAmount(sidePot.amount).formatted
          : `${getCurrencySymbol ? getCurrencySymbol() : '$'}${sidePot.amount.toFixed(2)}`;

        return {
          display,
          eligible: sidePot.eligiblePlayers.length,
          key: `sidepot-${index}-${sidePot.amount}`,
        };
      });
    }, [sidePots, displayValues, getCurrencySymbol]);

    return (
      <div className={cn('', className)}>
        <div className="bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-slate-700 shadow-lg">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
            <div>
              <p className="text-sm sm:text-base font-bold text-amber-400">{displayPot}</p>
              {sidePotDisplays && (
                <div className="text-xs text-slate-400 mt-1">
                  {sidePotDisplays.map((sidePot) => (
                    <p key={sidePot.key}>
                      Side pot: {sidePot.display} ({sidePot.eligible} players)
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for better performance
    return (
      prevProps.pot === nextProps.pot &&
      prevProps.getCurrencySymbol === nextProps.getCurrencySymbol &&
      prevProps.displayValues === nextProps.displayValues &&
      JSON.stringify(prevProps.sidePots) === JSON.stringify(nextProps.sidePots)
    );
  },
);

PotDisplayOptimized.displayName = 'PotDisplayOptimized';

export { PotDisplayOptimized };
