
import React from 'react';

interface CommunityCardsProps {
  cards: string[];
}

const CommunityCards = ({ cards }: CommunityCardsProps) => {
  if (cards.length === 0) {
    return null;
  }

  const renderCard = (card: string, index: number) => {
    if (!card) {
return null;
}

    const suit = card.slice(-1).toLowerCase();
    const rank = card.slice(0, -1);
    
    const suitSymbols: { [key: string]: string } = {
      'h': '♥',
      'd': '♦',
      'c': '♣',
      's': '♠',
    };

    const isRed = suit === 'h' || suit === 'd';

    return (
      <div
        key={`${card}-${index}`}
        className="w-8 h-12 sm:w-12 sm:h-16 bg-white rounded border border-gray-300 flex flex-col items-center justify-center shadow-lg transform hover:scale-105 transition-transform"
      >
        <div className={`text-sm sm:text-lg font-bold ${isRed ? 'text-red-500' : 'text-black'}`}>
          {rank}
        </div>
        <div className={`text-xs sm:text-base ${isRed ? 'text-red-500' : 'text-black'}`}>
          {suitSymbols[suit]}
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      {cards.map((card, index) => renderCard(card, index))}
    </div>
  );
};

export default CommunityCards;
