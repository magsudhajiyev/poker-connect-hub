
import React, { useState } from 'react';
import { Player } from '@/types/shareHand';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Crown, User, Plus } from 'lucide-react';

interface ClickablePlayerSeatProps {
  position: string;
  positionCoords: { x: number; y: number };
  player?: Player;
  gameFormat?: string;
  onUpdatePlayer: (player: Player) => void;
  onRemovePlayer: (playerId: string) => void;
  availablePositions: Array<{value: string, label: string}>;
}

const ClickablePlayerSeat = ({ 
  position, 
  positionCoords, 
  player, 
  gameFormat = 'cash',
  onUpdatePlayer,
  onRemovePlayer
}: ClickablePlayerSeatProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [playerName, setPlayerName] = useState(player?.name || '');
  const [stackSize, setStackSize] = useState(player?.stackSize[0]?.toString() || '100');
  const [isHero, setIsHero] = useState(player?.isHero || false);

  const getPositionLabel = (pos: string) => {
    const labels: { [key: string]: string } = {
      'utg': 'UTG',
      'utg1': 'UTG+1',
      'mp': 'MP',
      'lj': 'LJ',
      'hj': 'HJ',
      'co': 'CO',
      'btn': 'BTN',
      'sb': 'SB',
      'bb': 'BB'
    };
    return labels[pos] || pos.toUpperCase();
  };

  const handleSave = () => {
    if (!playerName.trim()) return;
    
    const newPlayer: Player = {
      id: player?.id || `player_${position}_${Date.now()}`,
      name: playerName,
      position: position,
      stackSize: [parseInt(stackSize) || 100],
      isHero: isHero
    };
    
    onUpdatePlayer(newPlayer);
    setIsOpen(false);
  };

  const handleRemove = () => {
    if (player) {
      onRemovePlayer(player.id);
      setIsOpen(false);
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
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className="cursor-pointer">
            {isEmpty ? (
              /* Empty Position */
              <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20'} rounded-full border-2 border-dashed border-slate-500 bg-slate-800/40 hover:bg-slate-700/60 transition-all duration-300 flex flex-col items-center justify-center group`}>
                <Plus className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-slate-400 group-hover:text-slate-300`} />
                <div className={`${isMobile ? 'text-[9px]' : 'text-xs'} text-slate-400 font-bold bg-slate-700/50 px-1 py-0.5 rounded mt-1`}>
                  {getPositionLabel(position)}
                </div>
              </div>
            ) : (
              /* Occupied Position */
              <div className="flex flex-col items-center space-y-1">
                <div 
                  className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20'} rounded-full border-3 flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 hover:scale-105 ${
                    player.isHero
                      ? 'border-blue-400 bg-blue-500/30 shadow-md'
                      : 'border-slate-300 bg-slate-600/40 shadow-md'
                  }`}
                >
                  {/* Hero Crown */}
                  {player.isHero && (
                    <Crown className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-yellow-400 mb-1`} />
                  )}
                  
                  {/* Stack Size */}
                  <div className={`${isMobile ? 'text-[10px]' : 'text-xs sm:text-sm'} font-bold ${
                    player.isHero ? 'text-blue-200' : 'text-slate-100'
                  }`}>
                    {gameFormat === 'cash' ? '$' : ''}{player.stackSize[0]}{gameFormat === 'mtt' ? 'BB' : ''}
                  </div>
                </div>

                {/* Player Info */}
                <div className="flex flex-col items-center space-y-0.5">
                  <div className={`${isMobile ? 'text-[11px]' : 'text-sm sm:text-base'} font-medium px-2 py-1 rounded bg-slate-800/80 text-center ${isMobile ? 'max-w-20' : 'max-w-24'} truncate border ${
                    player.isHero ? 'text-blue-200 border-blue-400/30' : 'text-slate-100 border-slate-500/30'
                  }`}>
                    {player.name}
                  </div>
                  
                  <div className={`${isMobile ? 'text-[9px]' : 'text-xs'} text-slate-300 font-bold bg-slate-700/50 px-1 py-0.5 rounded`}>
                    {getPositionLabel(position)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogTrigger>

        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-200">
              {isEmpty ? `Add Player - ${getPositionLabel(position)}` : `Edit Player - ${getPositionLabel(position)}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="player-name" className="text-slate-300 text-sm">Player Name</Label>
              <Input
                id="player-name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter player name"
                className="bg-slate-800/50 border-slate-600 text-slate-200"
              />
            </div>

            <div>
              <Label htmlFor="stack-size" className="text-slate-300 text-sm">
                Stack Size {gameFormat === 'cash' ? '($)' : '(BB)'}
              </Label>
              <Input
                id="stack-size"
                value={stackSize}
                onChange={(e) => setStackSize(e.target.value)}
                placeholder="100"
                type="number"
                className="bg-slate-800/50 border-slate-600 text-slate-200"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-hero"
                checked={isHero}
                onChange={(e) => setIsHero(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="is-hero" className="text-slate-300 text-sm flex items-center gap-1">
                <Crown className="w-4 h-4 text-yellow-400" />
                This is the Hero
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={!playerName.trim()}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isEmpty ? 'Add Player' : 'Save Changes'}
              </Button>
              
              {!isEmpty && (
                <Button
                  onClick={handleRemove}
                  variant="destructive"
                  className="px-4"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClickablePlayerSeat;
