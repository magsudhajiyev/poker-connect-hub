
import React from 'react';
import ClickablePlayerSeat from './ClickablePlayerSeat';
import CommunityCards from './CommunityCards';
import PokerTableSurface from './PokerTableSurface';
import DealerButton from './DealerButton';
import { Player } from '@/types/shareHand';
import { usePokerTableLogic } from './usePokerTableLogic';

interface PokerTableContainerProps {
  players: Player[];
  communityCards?: string[];
  currentPlayer?: string;
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

const PokerTableContainer = ({ 
  players, 
  communityCards = [], 
  currentPlayer,
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
}: PokerTableContainerProps) => {
  const {
    allPositions,
    seatPositions,
    getPlayerAtPosition,
    hasHero,
    isPlayerToAct,
    getPlayerBetAmount,
    isMobile
  } = usePokerTableLogic(players, currentStreet, formData);

  return (
    <div className="relative w-full" style={{ aspectRatio: isMobile ? '1/1.3' : '2/1' }}>
      {/* Table Surface */}
      <PokerTableSurface />

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
      <DealerButton 
        seatPositions={seatPositions}
        isMobile={isMobile}
        hasButtonPlayer={!!getPlayerAtPosition('btn')}
      />
    </div>
  );
};

export default PokerTableContainer;
