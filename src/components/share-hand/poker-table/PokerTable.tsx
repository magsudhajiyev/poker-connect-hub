
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
  currentStreet?: string;
  formData?: any;
  getAvailableActions?: (street: string, index: number, allActions: any[]) => string[];
  updateAction?: (street: any, index: number, action: string, betAmount?: string) => void;
  handleBetSizeSelect?: (street: any, index: number, amount: string) => void;
  isPositionsStep?: boolean;
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
  availablePositions,
  currentStreet,
  formData,
  getAvailableActions,
  updateAction,
  handleBetSizeSelect,
  isPositionsStep = false
}: PokerTableProps) => {
  const isMobile = useIsMobile();
  
  // All possible positions around the table in clockwise order starting from top
  const allPositions = ['utg', 'utg1', 'mp', 'lj', 'hj', 'co', 'btn', 'sb', 'bb'];
  
  // Calculate evenly spaced positions around an ellipse
  const calculatePositions = () => {
    const positions: { [key: string]: { mobile: { x: number; y: number }, desktop: { x: number; y: number } } } = {};
    
    // Center coordinates
    const centerX = 50;
    const centerY = 50;
    
    // Ellipse radii (percentage of container)
    // Make mobile more vertically elliptical for better spacing
    const radiusX = isMobile ? 35 : 42; // Smaller horizontal radius on mobile
    const radiusY = isMobile ? 45 : 40; // Larger vertical radius on mobile
    
    // Starting angle (top center) - adjust to start at top
    const startAngle = -Math.PI / 2; // -90 degrees (top)
    
    // Calculate angular step for 9 positions
    const angleStep = (2 * Math.PI) / 9;
    
    allPositions.forEach((position, index) => {
      const angle = startAngle + (index * angleStep);
      
      // Calculate position on ellipse
      const x = centerX + radiusX * Math.cos(angle);
      const y = centerY + radiusY * Math.sin(angle);
      
      positions[position] = {
        mobile: { x, y },
        desktop: { x, y }
      };
    });
    
    return positions;
  };

  const seatPositions = calculatePositions();

  // Get player for a specific position
  const getPlayerAtPosition = (position: string) => {
    return players.find(p => p.position === position);
  };

  // Check if any player is already set as hero
  const hasHero = players.some(p => p.isHero);

  // Check if it's this player's turn to act
  const isPlayerToAct = (position: string) => {
    if (!currentStreet || !formData || isPositionsStep) return false;
    
    const actions = formData[currentStreet];
    if (!actions || actions.length === 0) {
      // If no actions exist yet, the first player (UTG for preflop) should act
      if (currentStreet === 'preflopActions') {
        return position === 'utg';
      }
      return position === 'sb'; // For other streets, SB acts first
    }
    
    const player = getPlayerAtPosition(position);
    if (!player) return false;
    
    // Find the first incomplete action
    const nextActionIndex = actions.findIndex((action: any) => !action.completed);
    if (nextActionIndex === -1) return false;
    
    const nextAction = actions[nextActionIndex];
    return nextAction.playerId === player.id;
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
      <div className="relative w-full" style={{ aspectRatio: isMobile ? '1/1.3' : '2/1' }}>
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
          const positionData = seatPositions[position];
          const coords = isMobile ? positionData.mobile : positionData.desktop;
          const player = getPlayerAtPosition(position);
          const isCurrentPlayer = currentPlayer === position;
          const isToAct = isPlayerToAct(position);

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
              isToAct={isToAct}
              currentStreet={currentStreet}
              formData={formData}
              getAvailableActions={getAvailableActions}
              updateAction={updateAction}
              handleBetSizeSelect={handleBetSizeSelect}
              isPositionsStep={isPositionsStep}
            />
          );
        })}

        {/* Dealer Button */}
        {getPlayerAtPosition('btn') && (
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
        )}
      </div>
    </div>
  );
};

export default PokerTable;
