
import React from 'react';

interface DealerButtonProps {
  seatPositions: { [key: string]: { mobile: { x: number; y: number }, desktop: { x: number; y: number } } };
  isMobile: boolean;
  hasButtonPlayer: boolean;
}

const DealerButton = ({ seatPositions, isMobile, hasButtonPlayer }: DealerButtonProps) => {
  if (!hasButtonPlayer) return null;

  return (
    <div 
      className="absolute w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center font-bold text-gray-800 text-xs shadow-lg z-10"
      style={{
        left: `${seatPositions['btn'][isMobile ? 'mobile' : 'desktop'].x - 8}%`,
        top: `${seatPositions['btn'][isMobile ? 'mobile' : 'desktop'].y + 8}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      D
    </div>
  );
};

export default DealerButton;
