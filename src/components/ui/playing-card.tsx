import React from 'react';
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
}

// Card size configurations
const cardSizes = {
  xs: {
    width: 'w-8',
    height: 'h-11',
    text: 'text-xs',
    corner: 'text-[8px]',
    suitSize: 'text-[10px]',
    centerSuit: 'text-lg',
  },
  sm: {
    width: 'w-10',
    height: 'h-14',
    text: 'text-sm',
    corner: 'text-[10px]',
    suitSize: 'text-xs',
    centerSuit: 'text-xl',
  },
  md: {
    width: 'w-12',
    height: 'h-16',
    text: 'text-base',
    corner: 'text-xs',
    suitSize: 'text-sm',
    centerSuit: 'text-2xl',
  },
  lg: {
    width: 'w-16',
    height: 'h-22',
    text: 'text-lg',
    corner: 'text-sm',
    suitSize: 'text-base',
    centerSuit: 'text-3xl',
  },
  xl: {
    width: 'w-20',
    height: 'h-28',
    text: 'text-xl',
    corner: 'text-base',
    suitSize: 'text-lg',
    centerSuit: 'text-4xl',
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
}) => {
  const sizeConfig = cardSizes[size];
  const suitInfo = suitConfig[suit];
  const rankDisplay = getRankDisplay(rank);

  const cardClasses = cn(
    // Base card styling
    'relative inline-block rounded-lg border-2 border-gray-300 bg-white shadow-md',
    'font-serif font-bold select-none transition-all duration-200',

    // Size classes
    sizeConfig.width,
    sizeConfig.height,

    // Interactive states
    onClick && !disabled && 'cursor-pointer hover:shadow-lg hover:scale-105',
    selected && 'ring-2 ring-blue-500 ring-offset-2',
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
    >
      {/* Top-left corner */}
      <div className={cn('absolute top-1 left-1 leading-none', sizeConfig.corner)}>
        <span>{rankDisplay}</span>
      </div>

      {/* Center suit symbol */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(sizeConfig.centerSuit, 'opacity-80')}>{suitInfo.symbol}</span>
      </div>

      {/* Bottom-right corner (rotated) */}
      <div
        className={cn(
          'absolute bottom-1 right-1 leading-none transform rotate-180',
          sizeConfig.corner,
        )}
      >
        <span>{rankDisplay}</span>
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
}

export const CardFromString: React.FC<CardFromStringProps> = ({ card, ...props }) => {
  const cardData = getCardDisplay(card);

  if (!cardData) {
    return (
      <div
        className={cn(
          'w-12 h-16 bg-gray-200 rounded-lg border-2 border-gray-300',
          'flex items-center justify-center text-gray-500 text-xs',
          props.className,
        )}
      >
        Invalid
      </div>
    );
  }

  return <PlayingCard rank={cardData.rank} suit={cardData.suit} {...props} />;
};

export default PlayingCard;
