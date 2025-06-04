
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, Trash2 } from 'lucide-react';
import { Player } from '@/types/shareHand';

interface PlayerRowProps {
  player: Player;
  gameFormat: string;
  availablePositions: { value: string; label: string }[];
  showValidationErrors: boolean;
  onUpdatePlayer: (playerId: string, updates: Partial<Player>) => void;
  onRemovePlayer: (playerId: string) => void;
}

const PlayerRow = ({ 
  player, 
  gameFormat, 
  availablePositions, 
  showValidationErrors,
  onUpdatePlayer,
  onRemovePlayer
}: PlayerRowProps) => {
  // Check if a player should be highlighted - ONLY when validation errors are being shown AND position is empty
  const shouldHighlightPlayer = showValidationErrors && (!player.position || player.position.trim() === '');

  const handlePositionChange = (value: string) => {
    console.log(`Position change for player ${player.id} (${player.name}): ${value}`);
    onUpdatePlayer(player.id, { position: value });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
      <div className="space-y-2">
        <Label className="text-slate-300 text-xs">Player Name</Label>
        <Input
          value={player.name}
          onChange={(e) => onUpdatePlayer(player.id, { name: e.target.value })}
          className="bg-slate-800/50 border-slate-700/50 text-slate-200 h-8 text-xs"
          disabled={player.isHero}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Label className="text-slate-300 text-xs">Position</Label>
            {shouldHighlightPlayer && <AlertCircle className="w-3 h-3 text-red-500" />}
          </div>
          {!player.isHero && player.id !== 'villain' && (
            <Button
              onClick={() => onRemovePlayer(player.id)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
        {shouldHighlightPlayer && (
          <p className="text-red-400 text-xs mb-2">Please select position</p>
        )}
        <Select 
          value={player.position} 
          onValueChange={handlePositionChange}
        >
          <SelectTrigger className={`bg-slate-800/50 border-slate-700/50 text-slate-200 h-8 text-xs ${
            shouldHighlightPlayer ? 'border-red-500' : ''
          }`}>
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {availablePositions.map((position) => (
              <SelectItem 
                key={position.value} 
                value={position.value}
                className="text-white hover:bg-slate-700 focus:bg-slate-700"
              >
                {position.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-300 text-xs">
          Stack: {gameFormat === 'cash' ? '$' : ''}{player.stackSize[0]}{gameFormat === 'mtt' ? ' BB' : ''}
        </Label>
        <div className="w-full [&>*]:w-full">
          <Slider
            value={player.stackSize}
            onValueChange={(value) => onUpdatePlayer(player.id, { stackSize: value })}
            max={gameFormat === 'cash' ? 1000 : 200}
            min={1}
            step={gameFormat === 'cash' ? 10 : 1}
            className="w-full [&_.range]:bg-gradient-to-r [&_.range]:from-emerald-500 [&_.range]:to-violet-500 [&_.thumb]:border-emerald-500"
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>1{gameFormat === 'cash' ? '0' : ''}</span>
          <span>{gameFormat === 'cash' ? '1000' : '200'}{gameFormat === 'mtt' ? ' BB' : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerRow;
