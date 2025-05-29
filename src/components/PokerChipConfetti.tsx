
import React, { useEffect, useState } from 'react';
import { PokerChip } from './PokerChips';

interface PokerChipConfettiProps {
  isActive: boolean;
  onComplete: () => void;
}

interface Chip {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  value: string;
  size: number;
}

const PokerChipConfetti = ({ isActive, onComplete }: PokerChipConfettiProps) => {
  const [chips, setChips] = useState<Chip[]>([]);

  const chipColors = [
    { color: '#10b981', value: '$25' },
    { color: '#3b82f6', value: '$100' },
    { color: '#8b5cf6', value: '$500' },
    { color: '#f59e0b', value: '$1K' },
    { color: '#ef4444', value: '$5K' },
  ];

  useEffect(() => {
    if (isActive) {
      // Create initial chips
      const newChips: Chip[] = [];
      for (let i = 0; i < 50; i++) {
        const chipType = chipColors[Math.floor(Math.random() * chipColors.length)];
        newChips.push({
          id: i,
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          vx: (Math.random() - 0.5) * 20,
          vy: Math.random() * -15 - 5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          color: chipType.color,
          value: chipType.value,
          size: Math.random() * 20 + 30,
        });
      }
      setChips(newChips);

      // Animation loop
      const animate = () => {
        setChips(prevChips => {
          const updatedChips = prevChips.map(chip => ({
            ...chip,
            x: chip.x + chip.vx,
            y: chip.y + chip.vy,
            vy: chip.vy + 0.5, // gravity
            rotation: chip.rotation + chip.rotationSpeed,
          })).filter(chip => chip.y < window.innerHeight + 100);

          if (updatedChips.length === 0) {
            setTimeout(onComplete, 500);
            return [];
          }

          return updatedChips;
        });
      };

      const interval = setInterval(animate, 16); // ~60fps
      return () => clearInterval(interval);
    }
  }, [isActive, onComplete]);

  if (!isActive || chips.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {chips.map(chip => (
        <div
          key={chip.id}
          className="absolute"
          style={{
            left: chip.x,
            top: chip.y,
            transform: `rotate(${chip.rotation}deg)`,
            width: chip.size,
            height: chip.size,
          }}
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white/20"
            style={{ 
              backgroundColor: chip.color,
              fontSize: `${chip.size * 0.25}px`
            }}
          >
            {chip.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PokerChipConfetti;
