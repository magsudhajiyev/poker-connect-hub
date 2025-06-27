import React, { useMemo } from 'react';
import { CardFromString } from '@/components/ui/playing-card';

interface CommunityCardsProps {
  cards: string[];
}

const CommunityCardsOptimized = React.memo<CommunityCardsProps>(({ cards }) => {
  // Memoize card components to avoid recalculation
  const cardComponents = useMemo(() => {
    return cards
      .map((card, index) => {
        if (typeof card === 'string' && card.length >= 2) {
          return (
            <CardFromString
              key={`${card}-${index}`}
              card={card}
              size="lg"
              className="hover:shadow-xl transition-shadow"
            />
          );
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
        {cardComponents}
      </div>
    </div>
  );
});

CommunityCardsOptimized.displayName = 'CommunityCardsOptimized';

export { CommunityCardsOptimized };
