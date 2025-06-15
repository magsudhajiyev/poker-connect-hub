
import React from 'react';
import ClickablePlayerSeat from './ClickablePlayerSeat';
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
  onUpdatePlayer: (player: Player) => void;
  onRemovePlayer: (playerId: string) => void;
  availablePositions: Array<{value: string, label: string}>;
}

const PokerTable = ({ 
  players, 
  communityCards = [], 
  currentPlayer,
  pot = 0,
  getCurrencySymbol = () => '$',
  gameFormat = 'cash',
  onUpdatePlayer,
  onRemovePlayer,
  availablePositions
}: PokerTableProps) => {
  const isMobile = useIsMobile();
  
  // All possible positions around the table
  const allPositions = ['utg', 'utg1', 'mp', 'lj', 'hj', 'co', 'btn', 'sb', 'bb'];
  
  // Position mapping for evenly distributed seats around the table
  const seatPositions = {
    'utg': { mobile: { x: 50, y: 5 }, desktop: { x: 50, y: 5 } },      // Top center
    'utg1': { mobile: { x: 80, y: 15 }, desktop: { x: 78, y: 18 } },   // Top right
    'mp': { mobile: { x: 95, y: 40 }, desktop: { x: 92, y: 40 } },     // Right middle-top
    'lj': { mobile: { x: 95, y: 60 }, desktop: { x: 92, y: 60 } },     // Right middle-bottom
    'hj': { mobile: { x: 80, y: 85 }, desktop: { x: 78, y: 82 } },     // Bottom right
    'co': { mobile: { x: 50, y: 95 }, desktop: { x: 50, y: 95 } },     // Bottom center
    'btn': { mobile: { x: 20, y: 85 }, desktop: { x: 22, y: 82 } },    // Bottom left
    'sb': { mobile: { x: 5, y: 60 }, desktop: { x: 8, y: 60 } },       // Left middle-bottom
    'bb': { mobile: { x: 5, y: 40 }, desktop: { x: 8, y: 40 } }        // Left middle-top
  };

  // Get player for a specific position
  const getPlayerAtPosition = (position: string) => {
    return players.find(p => p.position === position);
  };

  // Check if any player is already set as hero
  const hasHero = players.some(p => p.isHero);

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

        {/* Community Cards Area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <CommunityCards cards={communityCards} />
        </div>

        {/* All Position Seats (clickable) */}
        {allPositions.map((position) => {
          const positionData = seatPositions[position as keyof typeof seatPositions];
          const coords = isMobile ? positionData.mobile : positionData.desktop;
          const player = getPlayerAtPosition(position);
          const isCurrentPlayer = currentPlayer === position;

          return (
            <ClickablePlayerSeat
              key={position}
              position={position}
              positionCoords={coords}
              player={player}
              gameFormat={gameFormat}
              onUpdatePlayer={onUpdatePlayer}
              onRemovePlayer={onRemovePlayer}
              availablePositions={availablePositions}
              hasHero={hasHero}
            />
          );
        })}

        {/* Dealer Button */}
        {getPlayerAtPosition('btn') && (
          <div 
            className="absolute w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center font-bold text-gray-800 text-xs shadow-lg z-10"
            style={{
              left: `${isMobile ? 12 : 15}%`,
              top: `${isMobile ? 77 : 74}%`,
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
