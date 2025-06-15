
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Player } from '@/types/shareHand';

interface PlayerFormProps {
  player?: Player;
  availablePositions: Array<{value: string, label: string}>;
  hasHero: boolean;
  onSubmit: (player: Player) => void;
  onCancel: () => void;
}

const PlayerForm = ({ 
  player, 
  availablePositions, 
  hasHero, 
  onSubmit, 
  onCancel 
}: PlayerFormProps) => {
  const [name, setName] = useState(player?.name || '');
  const [position, setPosition] = useState(player?.position || '');
  const [stackSize, setStackSize] = useState(player?.stackSize?.[0]?.toString() || '100');
  const [isHero, setIsHero] = useState(player?.isHero || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !position || !stackSize) {
      return;
    }

    const newPlayer: Player = {
      id: player?.id || `player-${Date.now()}`,
      name: name.trim(),
      position,
      stackSize: [parseFloat(stackSize)],
      isHero
    };

    onSubmit(newPlayer);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="player-name" className="text-slate-300">Name</Label>
        <Input
          id="player-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Player name"
          className="bg-slate-900/50 border-slate-700/50 text-slate-200 mt-1"
        />
      </div>

      <div>
        <Label htmlFor="player-position" className="text-slate-300">Position</Label>
        <Select value={position} onValueChange={setPosition}>
          <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200 mt-1">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            {availablePositions.map((pos) => (
              <SelectItem key={pos.value} value={pos.value}>
                {pos.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="player-stack" className="text-slate-300">Stack Size</Label>
        <Input
          id="player-stack"
          type="number"
          value={stackSize}
          onChange={(e) => setStackSize(e.target.value)}
          placeholder="100"
          className="bg-slate-900/50 border-slate-700/50 text-slate-200 mt-1"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is-hero"
          checked={isHero}
          onCheckedChange={(checked) => setIsHero(!!checked)}
          disabled={hasHero && !player?.isHero}
        />
        <Label htmlFor="is-hero" className="text-slate-300">
          This is the Hero (your position)
        </Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {player ? 'Update' : 'Add'} Player
        </Button>
      </div>
    </form>
  );
};

export default PlayerForm;
