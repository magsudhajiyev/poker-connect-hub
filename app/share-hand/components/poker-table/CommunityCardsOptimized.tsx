import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CardType } from '@/types/shareHand';

// Static data outside component
const SUIT_SYMBOLS: { [key: string]: string } = {
  h: '♥',
  d: '♦',
  c: '♣',
  s: '♠',
};

const SUIT_COLORS: { [key: string]: string } = {
  h: 'text-red-500',
  d: 'text-blue-500',
  c: 'text-green-500',
  s: 'text-slate-700',
};

interface CommunityCardsProps {
  cards: CardType[];
}

const CommunityCardsOptimized = React.memo<CommunityCardsProps>(({ cards }) => {
  // Memoize card parsing to avoid recalculation
  const parsedCards = useMemo(() => {
    return cards
      .map((card) => {
        if (typeof card === 'string' && card.length >= 2) {
          const rank = card.slice(0, -1);
          const suit = card.slice(-1).toLowerCase();
          return { rank, suit };
        }
        return null;
      })
      .filter(Boolean);
  }, [cards]);

  // Early return if no cards
  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div className="flex flex-wrap justify-center gap-2 p-4 bg-slate-900/80 rounded-lg backdrop-blur-sm">
        {parsedCards.map((card, index) => {
          if (!card) {
return null;
}

          const suitSymbol = SUIT_SYMBOLS[card.suit] || card.suit;
          const suitColor = SUIT_COLORS[card.suit] || 'text-slate-400';

          return (
            <Card
              key={`${card.rank}${card.suit}-${index}`}
              className="relative w-16 h-24 bg-white border-2 border-slate-700 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className={cn('text-2xl font-bold', suitColor)}>{card.rank}</div>
              <div className={cn('text-3xl', suitColor)}>{suitSymbol}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
});

CommunityCardsOptimized.displayName = 'CommunityCardsOptimized';

export { CommunityCardsOptimized };
