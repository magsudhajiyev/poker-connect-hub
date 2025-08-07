import React, { useMemo, useRef, useEffect } from 'react';
import { CardFromString } from '@/components/ui/playing-card';

interface CommunityCardsProps {
  cards: string[];
}

const CommunityCardsOptimized = React.memo<CommunityCardsProps>(({ cards }) => {
  const previousCardsRef = useRef<string[]>([]);
  const [shouldAnimate, setShouldAnimate] = React.useState(false);

  // Track changes to trigger animations
  useEffect(() => {
    const prevCards = previousCardsRef.current;
    const currentCards = cards || [];

    // Only animate if we have new cards (length increased)
    if (currentCards.length > prevCards.length) {
      setShouldAnimate(true);
      // Reset animation flag after a delay
      const timer = setTimeout(() => setShouldAnimate(false), 2000);
      return () => clearTimeout(timer);
    }

    previousCardsRef.current = currentCards;
  }, [cards]);

  // Filter and validate cards, memoize card components to avoid recalculation
  const cardComponents = useMemo(() => {
    if (!cards || !Array.isArray(cards)) {
      return [];
    }

    // Debug logging to help identify the issue
    if (process.env.NODE_ENV === 'development' && cards.length > 0) {
      // Debug log removed for production
    }

    const previousCards = previousCardsRef.current;
    const currentCards = cards || [];

    return currentCards
      .filter((card) => card && typeof card === 'string' && card.length >= 2)
      .map((card, index) => {
        try {
          // Determine if this is a new card
          const isNewCard = index >= previousCards.length && shouldAnimate;
          // Calculate staggered delay for deal animation
          const dealDelay = isNewCard ? (index - previousCards.length) * 150 : 0;

          return (
            <div
              key={`community-card-wrapper-${card}-${index}`}
              className="motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out"
              style={{
                animationDelay: isNewCard ? `${dealDelay}ms` : undefined,
              }}
            >
              <CardFromString
                key={`community-card-${card}-${index}`}
                card={card}
                size="md"
                className="relative z-10 group"
                dealAnimation={isNewCard}
                dealDelay={dealDelay}
                isNewCard={isNewCard}
              />
            </div>
          );
        } catch (error) {
          console.error('Error rendering community card:', card, error);
          return null;
        }
      })
      .filter(Boolean);
  }, [cards, shouldAnimate]);

  // Early return if no valid cards
  if (!cards || cards.length === 0 || cardComponents.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-row justify-center items-center gap-1 sm:gap-1.5 md:gap-2">
      {cardComponents}
    </div>
  );
});

CommunityCardsOptimized.displayName = 'CommunityCardsOptimized';

export { CommunityCardsOptimized };
