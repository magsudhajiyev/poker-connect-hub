
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crown } from 'lucide-react';
import { Player } from '@/types/shareHand';

interface PlayerEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  position: string;
  player?: Player;
  gameFormat: string;
  hasHero: boolean;
  onSave: (player: Player) => void;
  onRemove: () => void;
}

const PlayerEditDialog = ({
  isOpen,
  onOpenChange,
  position,
  player,
  gameFormat,
  hasHero,
  onSave,
  onRemove
}: PlayerEditDialogProps) => {
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
    
    onSave(newPlayer);
    onOpenChange(false);
  };

  const handleRemove = () => {
    onRemove();
    onOpenChange(false);
  };

  // Reset form when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setPlayerName(player?.name || '');
      setStackSize(player?.stackSize[0]?.toString() || '100');
      setIsHero(player?.isHero || false);
    }
  }, [isOpen, player]);

  // Determine if hero checkbox should be disabled
  const isHeroCheckboxDisabled = hasHero && !player?.isHero;
  const isEmpty = !player;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              disabled={isHeroCheckboxDisabled}
              className="rounded"
            />
            <Label 
              htmlFor="is-hero" 
              className={`text-sm flex items-center gap-1 ${
                isHeroCheckboxDisabled ? 'text-slate-500' : 'text-slate-300'
              }`}
            >
              <Crown className="w-4 h-4 text-yellow-400" />
              This is the Hero
              {isHeroCheckboxDisabled && (
                <span className="text-xs text-slate-500 ml-2">(Hero already selected)</span>
              )}
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
  );
};

export default PlayerEditDialog;
