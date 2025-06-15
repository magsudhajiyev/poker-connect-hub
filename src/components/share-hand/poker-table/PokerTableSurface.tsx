
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const PokerTableSurface = () => {
  const isMobile = useIsMobile();

  return (
    <div 
      className={`absolute inset-0 bg-gradient-to-br from-green-800 to-green-900 border-4 border-amber-600 shadow-2xl rounded-full`}
      style={{
        background: 'radial-gradient(ellipse at center, #1f7a3c, #15593f, #0d3520)',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.4)'
      }}
    >
      {/* Table Inner Shadow */}
      <div 
        className={`absolute inset-4 border-2 border-amber-700/30 rounded-full`}
        style={{
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.2)'
        }}
      />
    </div>
  );
};

export default PokerTableSurface;
