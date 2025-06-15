
import React, { useState } from 'react';
import { Player } from '@/types/shareHand';
import { DialogTrigger } from '@/components/ui/dialog';
import EmptySeatDisplay from './EmptySeatDisplay';
import PlayerSeatDisplay from './PlayerSeatDisplay';
import PlayerEditDialog from './PlayerEditDialog';

interface ClickablePlayerSeatProps {
  position: string;
  positionCoords: { x: number; y: number };
  player?: Player;
  gameFormat?: string;
  onUpdatePlayer: (player: Player) => void;
  onRemovePlayer: (playerId: string) => void;
  availablePositions: Array<{value: string, label: string}>;
  hasHero?: boolean;
}

const ClickablePlayerSeat = ({ 
  position, 
  positionCoords, 
  player, 
  gameFormat = 'cash',
  onUpdatePlayer,
  onRemovePlayer,
  hasHero = false
}: ClickablePlayerSeatProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = (newPlayer: Player) => {
    onUpdatePlayer(newPlayer);
  };

  const handleRemove = () => {
    if (player) {
      onRemovePlayer(player.id);
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
      <PlayerEditDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        position={position}
        player={player}
        gameFormat={gameFormat}
        hasHero={hasHero}
        onSave={handleSave}
        onRemove={handleRemove}
      />

      <div className="cursor-pointer" onClick={() => setIsOpen(true)}>
        {isEmpty ? (
          <EmptySeatDisplay position={position} />
        ) : (
          <PlayerSeatDisplay 
            player={player} 
            position={position} 
            gameFormat={gameFormat} 
          />
        )}
      </div>
    </div>
  );
};

export default ClickablePlayerSeat;
