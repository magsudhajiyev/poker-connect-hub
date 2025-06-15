import React, { useState } from 'react';
import PlayerSeatDisplay from './PlayerSeatDisplay';
import EmptySeatDisplay from './EmptySeatDisplay';
import { Player } from '@/types/shareHand';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import PlayerForm from './PlayerForm';

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
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const handleSeatClick = () => {
    console.log(`Seat ${position} clicked`);
  };

  const handleEditPlayer = (player: Player) => {
    onUpdatePlayer(player);
    setOpenEditDialog(false);
  };

  const handleRemovePlayerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (player) {
      onRemovePlayer(player.id);
    }
  };

  return (
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

          {/* Edit and Remove buttons */}
          <div className="absolute top-0 right-0 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-slate-700/50">
                  <Edit className="h-4 w-4 text-slate-400" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-slate-900 border border-slate-700 text-slate-200">
                <DialogHeader>
                  <DialogTitle>Edit Player</DialogTitle>
                  <DialogDescription>
                    Make changes to the player's details.
                  </DialogDescription>
                </DialogHeader>
                <PlayerForm 
                  player={player} 
                  availablePositions={availablePositions} 
                  hasHero={hasHero} 
                  onSubmit={handleEditPlayer} 
                  onCancel={() => setOpenEditDialog(false)} 
                />
              </DialogContent>
            </Dialog>
            
            <Button variant="ghost" size="icon" className="hover:bg-red-700/50" onClick={handleRemovePlayerClick}>
              <Trash2 className="h-4 w-4 text-red-400" />
            </Button>
          </div>
        </div>
      ) : (
        <div onClick={handleSeatClick} className="cursor-pointer">
          <EmptySeatDisplay position={position} />
        </div>
      )}

      {/* Edit Player Dialog */}
      <Dialog>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit player</DialogTitle>
            <DialogDescription>
              Make changes to the player here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {/* <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value="Astrid" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input id="username" value="@astrid" className="col-span-3" />
            </div>
          </div> */}
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClickablePlayerSeat;
