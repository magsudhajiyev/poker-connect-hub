import React, { useState } from 'react';
import PlayerSeatDisplay from './PlayerSeatDisplay';
import EmptySeatDisplay from './EmptySeatDisplay';
import PlayerEditDialog from './PlayerEditDialog';
import PlayerActionDialog from './PlayerActionDialog';
import { Player } from '@/types/shareHand';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface ClickablePlayerSeatProps {
  position: string;
  positionCoords: { x: number; y: number };
  player?: Player;
  gameFormat: string;
  onUpdatePlayer: (player: Player) => void;
  onRemovePlayer: (playerId: string) => void;
  availablePositions: Array<{value: string, label: string}>;
  hasHero: boolean;
  isToAct?: boolean;
  betAmount?: string | null;
  getCurrencySymbol?: () => string;
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
  gameFormat,
  onUpdatePlayer,
  onRemovePlayer,
  availablePositions,
  hasHero,
  isToAct = false,
  betAmount = null,
  getCurrencySymbol = () => '$',
  currentStreet,
  formData,
  getAvailableActions,
  updateAction,
  handleBetSizeSelect
}: ClickablePlayerSeatProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);

  // Determine if we're in an action step (Preflop, Flop, Turn, River)
  const isActionStep = currentStreet && ['preflopActions', 'flopActions', 'turnActions', 'riverActions'].includes(currentStreet);

  const handleSeatClick = () => {
    console.log(`Seat ${position} clicked - isActionStep: ${isActionStep}, hasPlayer: ${!!player}`);
    
    if (player && isActionStep) {
      // If we have a player and we're in an action step, show action dialog
      setIsActionDialogOpen(true);
    } else {
      // Otherwise, show edit dialog (for adding/editing player details)
      setIsEditDialogOpen(true);
    }
  };

  const handlePlayerSave = (newPlayer: Player) => {
    onUpdatePlayer(newPlayer);
    setIsEditDialogOpen(false);
  };

  const handlePlayerRemove = () => {
    if (player) {
      onRemovePlayer(player.id);
    }
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
        style={{
          left: `${positionCoords.x}%`,
          top: `${positionCoords.y}%`
        }}
      >
        {player ? (
          <div className="relative group">
            <div onClick={handleSeatClick} className="cursor-pointer">
              <PlayerSeatDisplay
                player={player}
                position={position}
                gameFormat={gameFormat}
                isToAct={isToAct}
                betAmount={betAmount}
                getCurrencySymbol={getCurrencySymbol}
              />
            </div>

            {/* Edit and Remove buttons - only show during non-action steps */}
            {!isActionStep && (
              <div className="absolute top-0 right-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-slate-700/50 w-6 h-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="h-3 w-3 text-slate-400" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-red-700/50 w-6 h-6" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayerRemove();
                  }}
                >
                  <Trash2 className="h-3 w-3 text-red-400" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div onClick={handleSeatClick} className="cursor-pointer">
            <EmptySeatDisplay position={position} />
          </div>
        )}
      </div>

      {/* Player Edit/Add Dialog - for adding/editing player details */}
      <PlayerEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        position={position}
        player={player}
        gameFormat={gameFormat}
        hasHero={hasHero}
        onSave={handlePlayerSave}
        onRemove={handlePlayerRemove}
      />

      {/* Player Action Dialog - for choosing poker actions */}
      {player && isActionStep && (
        <PlayerActionDialog
          isOpen={isActionDialogOpen}
          onOpenChange={setIsActionDialogOpen}
          player={player}
          position={position}
          currentStreet={currentStreet}
          formData={formData}
          getAvailableActions={getAvailableActions}
          updateAction={updateAction}
          handleBetSizeSelect={handleBetSizeSelect}
        />
      )}
    </>
  );
};

export default ClickablePlayerSeat;
