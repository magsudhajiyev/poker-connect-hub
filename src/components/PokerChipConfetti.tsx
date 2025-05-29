
import React, { useEffect, useState } from 'react';

interface PokerChipProps {
  id: number;
  color: string;
  value: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
}

interface PokerChipConfettiProps {
  isActive: boolean;
  onComplete: () => void;
}

const PokerChipConfetti: React.FC<PokerChipConfettiProps> = ({ isActive, onComplete }) => {
  const [chips, setChips] = useState<PokerChipProps[]>([]);

  useEffect(() => {
    if (!isActive) return;

    // Create poker chips with random properties
    const newChips: PokerChipProps[] = [];
    const chipColors = ['#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b'];
    const chipValues = ['$25', '$100', '$500', '$1K', '$5K'];
    
    for (let i = 0; i < 30; i++) {
      newChips.push({
        id: i,
        color: chipColors[Math.floor(Math.random() * chipColors.length)],
        value: chipValues[Math.floor(Math.random() * chipValues.length)],
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: Math.random() * -15 - 5,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
    
    setChips(newChips);

    // Animation loop
    let animationId: number;
    const animate = () => {
      setChips(prevChips => 
        prevChips.map(chip => ({
          ...chip,
          x: chip.x + chip.vx,
          y: chip.y + chip.vy,
          vy: chip.vy + 0.5, // gravity
          rotation: chip.rotation + chip.rotationSpeed,
        }))
      );
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Clean up after 3 seconds
    const timer = setTimeout(() => {
      cancelAnimationFrame(animationId);
      setChips([]);
      onComplete();
    }, 3000);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(timer);
    };
  }, [isActive, onComplete]);

  if (!isActive || chips.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {chips.map(chip => (
        <div
          key={chip.id}
          className="absolute w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg border-2 border-white/20"
          style={{
            backgroundColor: chip.color,
            left: chip.x - 16,
            top: chip.y - 16,
            transform: `rotate(${chip.rotation}deg)`,
            opacity: chip.y > window.innerHeight ? 0 : 1,
            transition: 'opacity 0.3s ease-out',
          }}
        >
          {chip.value}
        </div>
      ))}
    </div>
  );
};

export default PokerChipConfetti;
