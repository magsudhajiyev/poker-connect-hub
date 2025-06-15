
import React from 'react';
import PlayerSeat from './PlayerSeat';
import CommunityCards from './CommunityCards';
import { Player } from '@/types/shareHand';
import { useIsMobile } from '@/hooks/use-mobile';

interface PokerTableProps {
  players: Player[];
  communityCards?: string[];
  currentPlayer?: string;
  pot?: number;
  getCurrencySymbol?: () => string;
  gameFormat?: string;
}

const PokerTable = ({ 
  players, 
  communityCards = [], 
  currentPlayer,
  pot = 0,
  getCurrencySymbol = () => '$',
  gameFormat = 'cash'
}: PokerTableProps) => {
  const isMobile = useIsMobile();
  
  // Position mapping for seat arrangement around the table
  const seatPositions = {
    'utg': { mobile: { x: 50, y: 20 }, desktop: { x: 50, y: 15 } },
    'utg1': { mobile: { x: 80, y: 25 }, desktop: { x: 75, y: 20 } },
    'mp': { mobile: { x: 90, y: 50 }, desktop: { x: 85, y: 40 } },
    'lj': { mobile: { x: 80, y: 75 }, desktop: { x: 75, y: 80 } },
    'hj': { mobile: { x: 50, y: 80 }, desktop: { x: 50, y: 85 } },
    'co': { mobile: { x: 20, y: 75 }, desktop: { x: 25, y: 80 } },
    'btn': { mobile: { x: 10, y: 50 }, desktop: { x: 15, y: 40 } },
    'sb': { mobile: { x: 20, y: 25 }, desktop: { x: 25, y: 20 } },
    'bb': { mobile: { x: 35, y: 15 }, desktop: { x: 35, y: 15 } }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Pot Display */}
      {pot > 0 && (
        <div className="text-center mb-4">
          <div className="inline-block bg-emerald-900/30 border border-emerald-500/30 rounded-lg px-4 py-2">
            <span className="text-emerald-400 font-bold text-lg">
              Pot: {getCurrencySymbol()}{pot}
            </span>
          </div>
        </div>
      )}

      {/* Poker Table */}
      <div className="relative w-full" style={{ aspectRatio: isMobile ? '1.2/1' : '2/1' }}>
        {/* Table Surface */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-green-800 to-green-900 border-4 border-amber-600 shadow-2xl ${
            isMobile ? 'rounded-full' : 'rounded-full'
          }`}
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

        {/* Community Cards Area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <CommunityCards cards={communityCards} />
        </div>

        {/* Player Seats */}
        {players.map((player) => {
          const position = seatPositions[player.position as keyof typeof seatPositions];
          if (!position) return null;

          const coords = isMobile ? position.mobile : position.desktop;
          const isCurrentPlayer = currentPlayer === player.position;

          return (
            <PlayerSeat
              key={player.id}
              player={player}
              position={coords}
              isActive={isCurrentPlayer}
              gameFormat={gameFormat}
            />
          );
        })}

        {/* Dealer Button */}
        {players.find(p => p.position === 'btn') && (
          <div 
            className="absolute w-8 h-8 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center font-bold text-gray-800 text-xs shadow-lg"
            style={{
              left: `${isMobile ? 5 : 10}%`,
              top: `${isMobile ? 45 : 35}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            D
          </div>
        )}
      </div>
    </div>
  );
};

export default PokerTable;
