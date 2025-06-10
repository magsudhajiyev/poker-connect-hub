
import React, { useState } from 'react';
import { Player } from '@/types/shareHand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, User } from 'lucide-react';
import { useShareHandContext } from './ShareHandProvider';
import ActionButtons from './ActionButtons';

interface PlayerSeatProps {
  position: string;
  player?: Player;
  isAvailable: boolean;
  formData: any;
  setFormData: (data: any) => void;
  currentStep: number;
}

const PlayerSeat = ({ position, player, isAvailable, formData, setFormData, currentStep }: PlayerSeatProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [stackSize, setStackSize] = useState('100');
  
  const { getPositionName, gameStateUI } = useShareHandContext();
  
  const isCurrentPlayer = gameStateUI.isPlayerActive(position);
  const isActionPhase = currentStep >= 2; // Preflop and later

  const handleAddPlayer = () => {
    if (!playerName.trim()) return;
    
    const newPlayer: Player = {
      id: `player_${Date.now()}`,
      name: playerName.trim(),
      position: position,
      stackSize: [parseFloat(stackSize) || 100],
      isHero: false
    };

    const updatedPlayers = [...(formData.players || []), newPlayer];
    setFormData({
      ...formData,
      players: updatedPlayers
    });

    setPlayerName('');
    setStackSize('100');
    setIsEditing(false);
  };

  const handleSetAsHero = () => {
    if (!player) return;
    
    const updatedPlayers = formData.players.map((p: Player) => ({
      ...p,
      isHero: p.id === player.id
    }));
    
    setFormData({
      ...formData,
      players: updatedPlayers
    });
  };

  const handleRemovePlayer = () => {
    if (!player || player.id === 'hero') return;
    
    const updatedPlayers = formData.players.filter((p: Player) => p.id !== player.id);
    setFormData({
      ...formData,
      players: updatedPlayers
    });
  };

  if (isAvailable && !isEditing) {
    return (
      <div className="flex flex-col items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="w-16 h-16 rounded-full border-2 border-dashed border-gray-400 bg-gray-100/20 hover:bg-gray-100/40 flex flex-col items-center justify-center"
        >
          <Plus className="w-4 h-4 text-gray-400" />
        </Button>
        <span className="text-xs text-gray-400 mt-1">{getPositionName(position)}</span>
      </div>
    );
  }

  if (isEditing) {
    return (
      <Card className="p-3 bg-white/90 shadow-lg min-w-[120px]">
        <div className="space-y-2">
          <Input
            placeholder="Player name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="h-8 text-sm"
          />
          <Input
            placeholder="Stack size"
            value={stackSize}
            onChange={(e) => setStackSize(e.target.value)}
            className="h-8 text-sm"
            type="number"
          />
          <div className="flex gap-1">
            <Button size="sm" onClick={handleAddPlayer} className="h-7 text-xs flex-1">
              Add
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="h-7 text-xs">
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (player) {
    return (
      <div className="flex flex-col items-center">
        <Card className={`p-3 min-w-[100px] shadow-lg transition-all ${
          player.isHero 
            ? 'bg-emerald-500/20 border-emerald-500' 
            : 'bg-white/90'
        } ${
          isCurrentPlayer 
            ? 'ring-2 ring-yellow-400 shadow-yellow-400/50' 
            : ''
        }`}>
          <div className="flex flex-col items-center space-y-1">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span className="font-medium text-sm">{player.name}</span>
            </div>
            
            <span className="text-xs text-gray-600">
              ${player.stackSize[0]}
            </span>
            
            {player.isHero && (
              <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded">
                Hero
              </span>
            )}
            
            {/* Action Buttons for current player */}
            {isActionPhase && isCurrentPlayer && (
              <ActionButtons 
                player={player}
                formData={formData}
                setFormData={setFormData}
                currentStep={currentStep}
              />
            )}
          </div>
        </Card>
        
        <div className="flex items-center space-x-1 mt-1">
          <span className="text-xs text-gray-400">{getPositionName(position)}</span>
          {!player.isHero && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSetAsHero}
              className="h-5 text-xs px-1"
            >
              Set Hero
            </Button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default PlayerSeat;
