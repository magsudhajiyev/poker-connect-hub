import React from 'react';
import ClickablePlayerSeat from './ClickablePlayerSeat';
import CommunityCards from './CommunityCards';
import { Player } from '@/types/shareHand';
import { useIsMobile } from '@/hooks/use-mobile';
import { standardizePosition, getActionOrder } from '@/utils/positionMapping';

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
  handleBetSizeSelect
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
    if (!currentStreet || !formData) {
      console.log('No currentStreet or formData for isPlayerToAct check');
      return false;
    }
    
    const actions = formData[currentStreet];
    const player = getPlayerAtPosition(position);
    if (!player) {
      console.log('No player found at position:', position);
      return false;
    }

    // If no actions exist yet, determine first to act based on position order
    if (!actions || actions.length === 0) {
      console.log('No actions found, determining first to act based on positions');
      
      // Get all players with positions
      const playersWithPositions = players.filter(p => p.position);
      if (playersWithPositions.length < 2) {
        console.log('Not enough players to determine action order');
        return false;
      }

      // Get action order for this street
      const uiPositions = playersWithPositions.map(p => p.position);
      const isPreflop = currentStreet === 'preflopActions';
      const orderedPositions = getActionOrder(uiPositions, isPreflop);
      
      // First position in order should be first to act
      if (orderedPositions.length > 0) {
        const firstToActStandardPos = orderedPositions[0];
        const playerStandardPos = standardizePosition(position);
        const isFirstToAct = playerStandardPos === firstToActStandardPos;
        
        console.log('First to act determination:', {
          position,
          playerStandardPos,
          firstToActStandardPos,
          isFirstToAct,
          orderedPositions,
          currentStreet
        });
        
        return isFirstToAct;
      }
    }
    
    // If actions exist, use existing logic
    if (actions && actions.length > 0) {
      // Find the first incomplete action (next to act)
      const nextActionIndex = actions.findIndex((action: any) => !action.completed);
      if (nextActionIndex === -1) {
        console.log('No incomplete actions found');
        return false;
      }
      
      const nextAction = actions[nextActionIndex];
      const isMatch = nextAction.playerId === player.id;
      
      console.log('DETAILED isPlayerToAct check:', {
        position,
        playerName: player.name,
        playerId: player.id,
        nextActionPlayerId: nextAction.playerId,
        nextActionPlayerName: nextAction.playerName,
        isMatch,
        currentStreet,
        nextActionIndex,
        nextAction,
        allActions: actions.map((a: any) => ({ 
          playerId: a.playerId, 
          playerName: a.playerName, 
          completed: a.completed,
          action: a.action 
        }))
      });
      
      return isMatch;
    }
    
    return false;
  };

  // Get the current bet amount for a player in this street
  const getPlayerBetAmount = (position: string) => {
    if (!currentStreet || !formData) return null;
    
    const actions = formData[currentStreet];
    if (!actions) return null;
    
    const player = getPlayerAtPosition(position);
    if (!player) return null;
    
    // Find the most recent completed bet or raise action for this player
    const playerActions = actions.filter((action: any) => 
      action.playerId === player.id && 
      action.completed && 
      (action.action === 'bet' || action.action === 'raise') &&
      action.betAmount
    );
    
    if (playerActions.length === 0) return null;
    
    // Get the most recent bet/raise
    const latestAction = playerActions[playerActions.length - 1];
    console.log('Player bet amount for', position, ':', latestAction.betAmount);
    return latestAction.betAmount;
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
          const betAmount = getPlayerBetAmount(position);

          console.log(`Rendering seat ${position}:`, {
            hasPlayer: !!player,
            playerName: player?.name,
            isToAct,
            betAmount,
            currentStreet
          });

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
              betAmount={betAmount}
              getCurrencySymbol={getCurrencySymbol}
              currentStreet={currentStreet}
              formData={formData}
              getAvailableActions={getAvailableActions}
              updateAction={updateAction}
              handleBetSizeSelect={handleBetSizeSelect}
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
