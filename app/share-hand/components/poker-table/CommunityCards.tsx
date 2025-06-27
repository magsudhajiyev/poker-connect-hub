'use client';

import React from 'react';
import { CardFromString } from '@/components/ui/playing-card';

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

    return (
      <CardFromString
        key={`${card}-${index}`}
        card={card}
        size="sm"
        className="hover:scale-105 transition-transform"
      />
    );
  };

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      {cards.map((card, index) => renderCard(card, index))}
    </div>
  );
};

export default CommunityCards;
