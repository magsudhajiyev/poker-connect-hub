import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// TypeScript types for playing cards
export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K';
export type CardSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface PlayingCardProps {
  rank: CardRank;
  suit: CardSuit;
  size?: CardSize;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  dealAnimation?: boolean;
  dealDelay?: number;
  isNewCard?: boolean;
}

// Card size configurations with responsive sizes
const cardSizes = {
  xs: {
    width: 'w-6 sm:w-8',
    height: 'h-8 sm:h-11',
    text: 'text-[10px] sm:text-xs',
    corner: 'text-[6px] sm:text-[8px]',
    suitSize: 'text-[8px] sm:text-[10px]',
    centerSuit: 'text-sm sm:text-lg',
  },
  sm: {
    width: 'w-8 sm:w-10',
    height: 'h-11 sm:h-14',
    text: 'text-xs sm:text-sm',
    corner: 'text-[8px] sm:text-[10px]',
    suitSize: 'text-[10px] sm:text-xs',
    centerSuit: 'text-lg sm:text-xl',
  },
  md: {
    width: 'w-10 sm:w-11 md:w-12',
    height: 'h-14 sm:h-[3.75rem] md:h-16',
    text: 'text-sm sm:text-base',
    corner: 'text-[10px] sm:text-xs',
    suitSize: 'text-xs sm:text-sm',
    centerSuit: 'text-xl sm:text-2xl',
  },
  lg: {
    width: 'w-12 sm:w-14 md:w-16',
    height: 'h-16 sm:h-[4.5rem] md:h-20',
    text: 'text-base sm:text-lg',
    corner: 'text-xs sm:text-sm',
    suitSize: 'text-sm sm:text-base',
    centerSuit: 'text-2xl sm:text-3xl',
  },
  xl: {
    width: 'w-16 sm:w-[4.5rem] md:w-20',
    height: 'h-20 sm:h-24 md:h-28',
    text: 'text-lg sm:text-xl',
    corner: 'text-sm sm:text-base',
    suitSize: 'text-base sm:text-lg',
    centerSuit: 'text-3xl sm:text-4xl',
  },
};

// Suit symbols and colors
const suitConfig = {
  spades: { symbol: '♠', color: 'text-gray-900', name: 'Spades' },
  hearts: { symbol: '♥', color: 'text-red-600', name: 'Hearts' },
  diamonds: { symbol: '♦', color: 'text-red-600', name: 'Diamonds' },
  clubs: { symbol: '♣', color: 'text-gray-900', name: 'Clubs' },
};

// Convert rank display (T -> 10)
const getRankDisplay = (rank: CardRank): string => {
  return rank === 'T' ? '10' : rank;
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  rank,
  suit,
  size = 'md',
  className,
  onClick,
  selected = false,
  disabled = false,
  dealAnimation = false,
  dealDelay = 0,
  isNewCard = false,
}) => {
  const [isVisible, setIsVisible] = useState(!dealAnimation);
  const [hasAnimated, setHasAnimated] = useState(!dealAnimation);

  // Handle deal animation
  useEffect(() => {
    if (dealAnimation && !hasAnimated) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasAnimated(true);
      }, dealDelay);
      return () => clearTimeout(timer);
    }
  }, [dealAnimation, dealDelay, hasAnimated]);
  const sizeConfig = cardSizes[size];
  const suitInfo = suitConfig[suit];
  const rankDisplay = getRankDisplay(rank);

  const cardClasses = cn(
    // Base card styling
    'relative inline-block rounded-lg border-2 border-gray-300 bg-white shadow-md',
    'font-serif font-bold select-none',
    'overflow-hidden', // Ensure content stays within bounds
    'transform-gpu', // Use GPU acceleration for better performance

    // Size classes
    sizeConfig.width,
    sizeConfig.height,

    // Animation classes - respect motion preferences
    'motion-safe:transition-all motion-safe:duration-300',
    'motion-reduce:transition-none',

    // Deal animation states
    dealAnimation && !isVisible && 'opacity-0 scale-75 rotate-12 translate-y-4',
    dealAnimation && isVisible && 'motion-safe:animate-card-deal',

    // New card pulse animation
    isNewCard && hasAnimated && 'motion-safe:animate-gentle-pulse',

    // Interactive states with enhanced animations
    onClick &&
      !disabled && [
        'cursor-pointer group',
        'motion-safe:hover:shadow-xl motion-safe:hover:shadow-blue-500/25',
        'motion-safe:hover:animate-card-hover-lift',
        'motion-safe:hover:border-blue-400',
        'motion-safe:active:scale-95',
        'motion-safe:transition-all motion-safe:duration-200',
      ],
    selected && 'ring-2 ring-blue-500 ring-offset-2 shadow-lg shadow-blue-500/25',
    disabled && 'opacity-50 cursor-not-allowed',

    // Color classes
    suitInfo.color,

    className,
  );

  return (
    <div
      className={cardClasses}
      onClick={onClick && !disabled ? onClick : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={`${rankDisplay} of ${suitInfo.name}`}
      tabIndex={onClick && !disabled ? 0 : undefined}
      style={{
        animationDelay: dealAnimation ? `${dealDelay}ms` : undefined,
      }}
    >
      {/* Top-left corner */}
      <div
        className={cn(
          'absolute top-1 left-1 leading-none pointer-events-none',
          'flex items-start justify-start min-w-0',
          sizeConfig.corner,
        )}
      >
        <span className="block whitespace-nowrap">{rankDisplay}</span>
      </div>

      {/* Center suit symbol with subtle animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className={cn(
            sizeConfig.centerSuit,
            'opacity-80 block',
            'motion-safe:transition-transform motion-safe:duration-200',
            onClick &&
              !disabled &&
              'motion-safe:group-hover:scale-110 motion-safe:group-hover:drop-shadow-sm',
          )}
        >
          {suitInfo.symbol}
        </span>
      </div>

      {/* Bottom-right corner (rotated) */}
      <div
        className={cn(
          'absolute bottom-1 right-1 leading-none transform rotate-180 pointer-events-none',
          'flex items-start justify-start min-w-0',
          sizeConfig.corner,
        )}
      >
        <span className="block whitespace-nowrap">{rankDisplay}</span>
      </div>
    </div>
  );
};

// Utility function to convert card string to component props
export const getCardDisplay = (card: string): { rank: CardRank; suit: CardSuit } | null => {
  if (!card || card.length < 2) {
    return null;
  }

  // Handle different rank formats
  let rank: string;
  let suitChar: string;

  if (card.length === 3 && card.startsWith('10')) {
    rank = 'T';
    suitChar = card.slice(2);
  } else {
    rank = card.slice(0, -1);
    suitChar = card.slice(-1);
  }

  // Convert T to T for consistency, and 10 to T
  if (rank === '10') {
    rank = 'T';
  }

  // Validate rank
  const validRanks: CardRank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
  if (!validRanks.includes(rank as CardRank)) {
    return null;
  }

  // Convert suit character to suit name
  const suitMap: Record<string, CardSuit> = {
    s: 'spades',
    '♠': 'spades',
    spades: 'spades',
    h: 'hearts',
    '♥': 'hearts',
    hearts: 'hearts',
    d: 'diamonds',
    '♦': 'diamonds',
    diamonds: 'diamonds',
    c: 'clubs',
    '♣': 'clubs',
    clubs: 'clubs',
  };

  const suit = suitMap[suitChar.toLowerCase()];
  if (!suit) {
    return null;
  }

  return { rank: rank as CardRank, suit };
};

// Helper component for easy card rendering from string
interface CardFromStringProps {
  card: string;
  size?: CardSize;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  dealAnimation?: boolean;
  dealDelay?: number;
  isNewCard?: boolean;
}

export const CardFromString: React.FC<CardFromStringProps> = ({
  card,
  dealAnimation = false,
  dealDelay = 0,
  isNewCard = false,
  ...props
}) => {
  const cardData = getCardDisplay(card);

  if (!cardData) {
    // Add debug info to help identify invalid cards
    console.error('Invalid card data for card:', card);
    return (
      <div
        className={cn(
          'w-12 h-16 bg-red-200 rounded-lg border-2 border-red-400',
          'flex items-center justify-center text-red-600 text-xs font-bold',
          'overflow-hidden',
          props.className,
        )}
        title={`Invalid card: ${card}`}
      >
        <span className="text-center">
          BAD
          <br />
          CARD
        </span>
      </div>
    );
  }

  return (
    <PlayingCard
      rank={cardData.rank}
      suit={cardData.suit}
      dealAnimation={dealAnimation}
      dealDelay={dealDelay}
      isNewCard={isNewCard}
      {...props}
    />
  );
};

export default PlayingCard;
