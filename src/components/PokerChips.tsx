
import React, { CSSProperties } from 'react';

interface PokerChipProps {
  color: string;
  value: string;
  className?: string;
  style?: CSSProperties;
}

const PokerChip = ({ color, value, className = '', style }: PokerChipProps) => {
  return (
    <div 
      className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg border-2 sm:border-4 border-white/20 ${className}`}
      style={{ backgroundColor: color, ...style }}
    >
      {value}
    </div>
  );
};

const PokerChips = () => {
  const chips = [
    { color: '#10b981', value: '$25', top: '25%', right: '15%', delay: '0s' },
    { color: '#3b82f6', value: '$100', top: '45%', right: '5%', delay: '1.5s' },
    { color: '#8b5cf6', value: '$500', top: '65%', right: '20%', delay: '0.8s' }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {chips.map((chip, index) => (
        <PokerChip
          key={index}
          color={chip.color}
          value={chip.value}
          className="absolute animate-pulse hidden sm:flex"
          style={{
            top: chip.top,
            right: chip.right,
            animationDelay: chip.delay,
            animationDuration: '2s'
          }}
        />
      ))}
    </div>
  );
};

export default PokerChips;
