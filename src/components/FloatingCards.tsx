
import React, { CSSProperties } from 'react';

interface FloatingCardProps {
  suit: string;
  className?: string;
  style?: CSSProperties;
}

const FloatingCard = ({ suit, className = '', style }: FloatingCardProps) => {
  return (
    <div className={`w-6 h-8 sm:w-8 sm:h-12 md:w-10 md:h-14 bg-white rounded-lg flex items-center justify-center text-lg sm:text-2xl md:text-3xl shadow-lg ${className}`} style={style}>
      {suit}
    </div>
  );
};

const FloatingCards = () => {
  const cards = [
    { suit: '♠', top: '20%', left: '5%', delay: '0s' },
    { suit: '♥', top: '60%', left: '8%', delay: '1s' },
    { suit: '♦', top: '30%', left: '88%', delay: '2s' },
    { suit: '♣', top: '70%', left: '85%', delay: '0.5s' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {cards.map((card, index) => (
        <FloatingCard
          key={index}
          suit={card.suit}
          className="absolute animate-bounce hidden sm:flex"
          style={{
            top: card.top,
            left: card.left,
            animationDelay: card.delay,
            animationDuration: '3s',
          }}
        />
      ))}
    </div>
  );
};

export default FloatingCards;
