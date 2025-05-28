
import React from 'react';

interface PokerChipProps {
  color: string;
  value: string;
  className?: string;
}

const PokerChip = ({ color, value, className = "" }: PokerChipProps) => {
  return (
    <div className={`relative w-16 h-16 ${className}`}>
      <div className={`w-full h-full rounded-full ${color} border-4 border-white shadow-lg flex items-center justify-center relative overflow-hidden`}>
        {/* Chip pattern */}
        <div className="absolute inset-2 rounded-full border-2 border-white/30"></div>
        <div className="absolute inset-4 rounded-full border border-white/20"></div>
        {/* Value */}
        <span className="text-white font-bold text-sm z-10">{value}</span>
        {/* Shine effect */}
        <div className="absolute top-1 left-1 w-3 h-3 bg-white/40 rounded-full blur-sm"></div>
      </div>
    </div>
  );
};

export const PokerChips = () => {
  const chips = [
    { color: 'bg-red-600', value: '5' },
    { color: 'bg-blue-600', value: '10' },
    { color: 'bg-green-600', value: '25' },
    { color: 'bg-black', value: '100' },
  ];

  return (
    <div className="flex space-x-2">
      {chips.map((chip, index) => (
        <PokerChip
          key={index}
          color={chip.color}
          value={chip.value}
          className={`animate-bounce hover:scale-110 transition-transform duration-300`}
          style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default PokerChips;
