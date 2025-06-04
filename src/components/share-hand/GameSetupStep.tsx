
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Check, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface GameSetupStepProps {
  formData: any;
  setFormData: (data: any) => void;
  showValidationErrors?: boolean;
  invalidPlayerId?: string;
}

interface Player {
  id: string;
  name: string;
  position: string;
  stackSize: number[];
  isHero?: boolean;
}

const GameSetupStep = ({ formData, setFormData, showValidationErrors = false, invalidPlayerId }: GameSetupStepProps) => {
  const invalidPlayerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to invalid player when validation error occurs
  useEffect(() => {
    if (showValidationErrors && invalidPlayerId && invalidPlayerRef.current) {
      invalidPlayerRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [showValidationErrors, invalidPlayerId]);

  const getStackSizeLabel = () => {
    return formData.gameFormat === 'cash' ? 'Stack Size ($)' : 'Stack Size (BB)';
  };

  const getStackSizePlaceholder = () => {
    return formData.gameFormat === 'cash' ? '200' : '100';
  };

  // Initialize players if not exists
  const initializePlayers = () => {
    if (!formData.players) {
      const heroPlayer: Player = {
        id: 'hero',
        name: 'Hero',
        position: formData.heroPosition || '',
        stackSize: formData.heroStackSize || [100],
        isHero: true
      };
      
      const villainPlayer: Player = {
        id: 'villain',
        name: 'Villain',
        position: formData.villainPosition || '',
        stackSize: formData.villainStackSize || [100]
      };

      setFormData({
        ...formData,
        players: [heroPlayer, villainPlayer]
      });
    }
  };

  // Get players or initialize them
  const players: Player[] = formData.players || [];
  if (players.length === 0) {
    initializePlayers();
  }

  // Get all available positions (limited to 9 for max poker game size)
  const allPositions = [
    { value: 'utg', label: 'UTG' },
    { value: 'utg1', label: 'UTG+1' },
    { value: 'mp', label: 'Middle Position' },
    { value: 'lj', label: 'Lojack' },
    { value: 'hj', label: 'Hijack' },
    { value: 'co', label: 'Cut Off' },
    { value: 'btn', label: 'Button' },
    { value: 'sb', label: 'Small Blind' },
    { value: 'bb', label: 'Big Blind' }
  ];

  // Get available positions for a player (exclude other players' positions)
  const getAvailablePositions = (currentPlayerId: string) => {
    const usedPositions = players
      .filter(p => p.id !== currentPlayerId)
      .map(p => p.position)
      .filter(Boolean);
    
    return allPositions.filter(pos => !usedPositions.includes(pos.value));
  };

  // Update a player
  const updatePlayer = (playerId: string, updates: Partial<Player>) => {
    const updatedPlayers = players.map(player => 
      player.id === playerId ? { ...player, ...updates } : player
    );
    
    // Also update legacy formData fields for backwards compatibility
    const heroPlayer = updatedPlayers.find(p => p.isHero);
    const villainPlayer = updatedPlayers.find(p => p.id === 'villain');
    
    setFormData({
      ...formData,
      players: updatedPlayers,
      heroPosition: heroPlayer?.position || '',
      villainPosition: villainPlayer?.position || '',
      heroStackSize: heroPlayer?.stackSize || [100],
      villainStackSize: villainPlayer?.stackSize || [100]
    });
  };

  // Add a new player
  const addPlayer = () => {
    const newPlayer: Player = {
      id: `player_${Date.now()}`,
      name: `Player ${players.length + 1}`,
      position: '',
      stackSize: [100]
    };
    
    setFormData({
      ...formData,
      players: [...players, newPlayer]
    });
  };

  // Remove a player (except hero and villain)
  const removePlayer = (playerId: string) => {
    if (playerId === 'hero' || playerId === 'villain') return;
    
    const updatedPlayers = players.filter(p => p.id !== playerId);
    setFormData({
      ...formData,
      players: updatedPlayers
    });
  };

  // Check if this player should be highlighted
  const shouldHighlightPlayer = (playerId: string) => {
    return showValidationErrors && invalidPlayerId === playerId;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium text-slate-200 mb-3">Game Setup</h3>
      
      {/* Game Format Selection with Toggle Buttons */}
      <div>
        <Label className="text-slate-300 mb-2 block text-sm">Game Format</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={formData.gameFormat === 'mtt' ? 'default' : 'outline'}
            onClick={() => setFormData({...formData, gameFormat: 'mtt'})}
            className={`h-12 flex flex-col items-center justify-center relative ${
              formData.gameFormat === 'mtt' 
                ? 'bg-emerald-500 text-slate-900 border-emerald-500 hover:bg-emerald-600 hover:text-slate-900' 
                : 'border-slate-700/50 text-white hover:bg-slate-800/50 hover:text-white bg-slate-900/30'
            }`}
          >
            {formData.gameFormat === 'mtt' && (
              <Check className="absolute top-1 right-1 w-3 h-3" />
            )}
            <span className="font-black text-sm">MTT</span>
            <span className="text-xs font-bold">Multi-Table Tournament</span>
          </Button>
          
          <Button
            variant={formData.gameFormat === 'cash' ? 'default' : 'outline'}
            onClick={() => setFormData({...formData, gameFormat: 'cash'})}
            className={`h-12 flex flex-col items-center justify-center relative ${
              formData.gameFormat === 'cash' 
                ? 'bg-emerald-500 text-slate-900 border-emerald-500 hover:bg-emerald-600 hover:text-slate-900' 
                : 'border-slate-700/50 text-white hover:bg-slate-800/50 hover:text-white bg-slate-900/30'
            }`}
          >
            {formData.gameFormat === 'cash' && (
              <Check className="absolute top-1 right-1 w-3 h-3" />
            )}
            <span className="font-black text-sm">Cash Game</span>
            <span className="text-xs font-bold">Real Money Cash</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="game-type" className="text-slate-300 text-sm">Game Type</Label>
          <Select value={formData.gameType} onValueChange={(value) => setFormData({...formData, gameType: value})}>
            <SelectTrigger className="bg-slate-900/50 border-slate-700/50 text-slate-200 h-9">
              <SelectValue placeholder="Select game type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="nlhe" className="text-white hover:bg-slate-700 focus:bg-slate-700">No Limit Hold'em</SelectItem>
              <SelectItem value="plo" className="text-white hover:bg-slate-700 focus:bg-slate-700">Pot Limit Omaha</SelectItem>
              <SelectItem value="stud" className="text-white hover:bg-slate-700 focus:bg-slate-700">Seven Card Stud</SelectItem>
              <SelectItem value="mixed" className="text-white hover:bg-slate-700 focus:bg-slate-700">Mixed Games</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="stack-size" className="text-slate-300 text-sm">{getStackSizeLabel()}</Label>
          <Input
            id="stack-size"
            value={formData.stackSize}
            onChange={(e) => setFormData({...formData, stackSize: e.target.value})}
            placeholder={getStackSizePlaceholder()}
            className="bg-slate-900/50 border-slate-700/50 text-slate-200 h-9"
          />
        </div>
      </div>

      {/* Players Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-slate-200">Players</h4>
          <Button
            onClick={addPlayer}
            variant="outline"
            size="sm"
            className="border-slate-700/50 text-slate-300 hover:bg-slate-800/50 hover:text-white bg-slate-900/30"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Player
          </Button>
        </div>

        <div className="space-y-3">
          {players.map((player, index) => (
            <div 
              key={player.id} 
              ref={shouldHighlightPlayer(player.id) ? invalidPlayerRef : null}
              className={`grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 rounded-lg border transition-all duration-300 ${
                shouldHighlightPlayer(player.id)
                  ? 'bg-red-900/20 border-red-500/50 ring-2 ring-red-500/50'
                  : 'bg-slate-900/30 border-slate-700/30'
              }`}
            >
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">Player Name</Label>
                <Input
                  value={player.name}
                  onChange={(e) => updatePlayer(player.id, { name: e.target.value })}
                  className="bg-slate-800/50 border-slate-700/50 text-slate-200 h-8 text-xs"
                  disabled={player.isHero || player.id === 'villain'}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-300 text-xs">Position</Label>
                    {shouldHighlightPlayer(player.id) && (
                      <AlertCircle className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                  {!player.isHero && player.id !== 'villain' && (
                    <Button
                      onClick={() => removePlayer(player.id)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {shouldHighlightPlayer(player.id) && (
                  <p className="text-red-400 text-xs mb-2">Please select position</p>
                )}
                <Select 
                  value={player.position} 
                  onValueChange={(value) => updatePlayer(player.id, { position: value })}
                >
                  <SelectTrigger className={`bg-slate-800/50 border-slate-700/50 text-slate-200 h-8 text-xs ${
                    shouldHighlightPlayer(player.id) ? 'border-red-500 ring-1 ring-red-500' : ''
                  }`}>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 z-50">
                    {getAvailablePositions(player.id).map((position) => (
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
                  Stack: {formData.gameFormat === 'cash' ? '$' : ''}{player.stackSize[0]}{formData.gameFormat === 'mtt' ? ' BB' : ''}
                </Label>
                <Slider
                  value={player.stackSize}
                  onValueChange={(value) => updatePlayer(player.id, { stackSize: value })}
                  max={formData.gameFormat === 'cash' ? 1000 : 200}
                  min={1}
                  step={formData.gameFormat === 'cash' ? 10 : 1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>1{formData.gameFormat === 'cash' ? '0' : ''}</span>
                  <span>{formData.gameFormat === 'cash' ? '1000' : '200'}{formData.gameFormat === 'mtt' ? ' BB' : ''}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameSetupStep;
