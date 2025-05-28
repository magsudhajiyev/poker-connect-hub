
import React from 'react';

const FloatingCard = ({ suit, className = "" }: { suit: string; className?: string }) => {
  return (
    <div className={`absolute w-8 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center text-2xl animate-float ${className}`}>
      {suit}
    </div>
  );
};

export const FloatingCards = () => {
  const suits = ['♠', '♥', '♦', '♣'];
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {suits.map((suit, index) => (
        <FloatingCard
          key={index}
          suit={suit}
          className={`
            ${index === 0 ? 'top-10 left-10 text-black' : ''}
            ${index === 1 ? 'top-32 right-20 text-red-500' : ''}
            ${index === 2 ? 'bottom-40 left-32 text-red-500' : ''}
            ${index === 3 ? 'bottom-20 right-10 text-black' : ''}
          `}
          style={{ animationDelay: `${index * 0.5}s` } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default FloatingCards;
