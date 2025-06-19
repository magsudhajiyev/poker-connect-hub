
import React, { useState } from 'react';
import { Player } from '@/types/shareHand';
import EmptySeatDisplay from './EmptySeatDisplay';
import PlayerSeatDisplay from './PlayerSeatDisplay';
import PlayerEditDialog from './PlayerEditDialog';
import PlayerActionDialog from './PlayerActionDialog';

interface ClickablePlayerSeatProps {
  position: string;
  positionCoords: { x: number; y: number };
  player?: Player;
  gameFormat?: string;
  onUpdatePlayer: (player: Player) => void;
  onRemovePlayer: (playerId: string) => void;
  availablePositions: Array<{value: string, label: string}>;
  hasHero?: boolean;
  isToAct?: boolean;
  currentStreet?: string;
  formData?: any;
  getAvailableActions?: (street: string, index: number, allActions: any[]) => string[];
  updateAction?: (street: any, index: number, action: string, betAmount?: string) => void;
  handleBetSizeSelect?: (street: any, index: number, amount: string) => void;
  isPositionsStep?: boolean;
  pokerActions?: any;
}

const ClickablePlayerSeat = ({ 
  position, 
  positionCoords, 
  player, 
  gameFormat = 'cash',
  onUpdatePlayer,
  onRemovePlayer,
  hasHero = false,
  isToAct = false,
  currentStreet,
  formData,
  getAvailableActions,
  updateAction,
  handleBetSizeSelect,
  isPositionsStep = false,
  pokerActions
}: ClickablePlayerSeatProps) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);

  const handleSave = (newPlayer: Player) => {
    onUpdatePlayer(newPlayer);
  };

  const handleRemove = () => {
    if (player) {
      onRemovePlayer(player.id);
    }
  };

  const handleClick = () => {
    console.log('Player seat clicked:', {
      position,
      player: player?.name,
      isPositionsStep,
      currentStreet,
      hasGetAvailableActions: !!getAvailableActions,
      hasUpdateAction: !!updateAction
    });

    // If we're in the positions step, allow adding/editing players
    if (isPositionsStep) {
      setIsEditOpen(true);
      return;
    }

    // If we're not in positions step and there's no player, do nothing (disable adding)
    if (!player) {
      console.log('No player at position, ignoring click');
      return;
    }

    // If we're in an action step, show action dialog
    if (currentStreet) {
      console.log('Opening action dialog for player:', player.name);
      setIsActionOpen(true);
    } else {
      console.log('No current street defined');
    }
  };

  const isEmpty = !player;

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
      style={{
        left: `${positionCoords.x}%`,
        top: `${positionCoords.y}%`
      }}
    >
      {/* Player Edit Dialog - only show in positions step */}
      {isPositionsStep && (
        <PlayerEditDialog
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          position={position}
          player={player}
          gameFormat={gameFormat}
          hasHero={hasHero}
          onSave={handleSave}
          onRemove={handleRemove}
        />
      )}

      {/* Player Action Dialog - only show when not in positions step and player exists */}
      {!isPositionsStep && player && (
        <PlayerActionDialog
          isOpen={isActionOpen}
          onOpenChange={setIsActionOpen}
          player={player}
          position={position}
          currentStreet={currentStreet || 'preflopActions'}
          formData={formData}
          pokerActions={pokerActions}
          getAvailableActions={getAvailableActions}
          updateAction={updateAction}
          handleBetSizeSelect={handleBetSizeSelect}
        />
      )}

      <div 
        className={`${isPositionsStep || player ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`} 
        onClick={handleClick}
      >
        {isEmpty ? (
          <EmptySeatDisplay position={position} />
        ) : (
          <PlayerSeatDisplay 
            player={player} 
            position={position} 
            gameFormat={gameFormat}
            isToAct={isToAct}
          />
        )}
      </div>
    </div>
  );
};

export default ClickablePlayerSeat;
