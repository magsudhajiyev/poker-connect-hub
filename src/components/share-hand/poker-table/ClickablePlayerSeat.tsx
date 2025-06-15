
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
  handleBetSizeSelect
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
    if (!player) {
      // No player - open edit dialog to add player
      setIsEditOpen(true);
    } else if (isToAct && currentStreet && getAvailableActions && updateAction) {
      // Player exists and it's their turn - open action dialog
      setIsActionOpen(true);
    } else {
      // Player exists but not their turn - open edit dialog
      setIsEditOpen(true);
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
      {/* Player Edit Dialog */}
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

      {/* Player Action Dialog */}
      {player && currentStreet && (
        <PlayerActionDialog
          isOpen={isActionOpen}
          onOpenChange={setIsActionOpen}
          player={player}
          position={position}
          currentStreet={currentStreet}
          formData={formData}
          getAvailableActions={getAvailableActions}
          updateAction={updateAction}
          handleBetSizeSelect={handleBetSizeSelect}
        />
      )}

      <div className="cursor-pointer" onClick={handleClick}>
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
