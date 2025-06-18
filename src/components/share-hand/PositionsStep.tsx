
import { usePlayerManagement } from '@/hooks/usePlayerManagement';
import { getAvailablePositions } from '@/utils/positionUtils';
import { PokerTable } from './poker-table';
import { Player } from '@/types/shareHand';

interface PositionsStepProps {
  formData: any;
  setFormData: (data: any) => void;
  showValidationErrors?: boolean;
  getCurrencySymbol?: () => string;
}

const PositionsStep = ({ 
  formData, 
  setFormData, 
  showValidationErrors = false,
  getCurrencySymbol = () => '$'
}: PositionsStepProps) => {
  const { players, updatePlayer, removePlayer } = usePlayerManagement(formData, setFormData);

  const handleUpdatePlayer = (newPlayer: Player) => {
    // If this player is being set as hero, remove hero status from others
    if (newPlayer.isHero) {
      players.forEach(p => {
        if (p.isHero && p.id !== newPlayer.id) {
          updatePlayer(p.id, { isHero: false });
        }
      });
    }

    // Check if this is a new player or updating existing
    const existingPlayer = players.find(p => p.position === newPlayer.position);
    if (existingPlayer) {
      updatePlayer(existingPlayer.id, newPlayer);
    } else {
      // Add new player to the array
      const updatedPlayers = [...players, newPlayer];
      setFormData({
        ...formData,
        players: updatedPlayers
      });
    }
  };

  const handleRemovePlayer = (playerId: string) => {
    removePlayer(playerId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-base font-medium text-slate-200">Player Positions & Stack Sizes</h3>
        <p className="text-sm text-slate-400">Click on any position around the table to add or edit players</p>
      </div>

      {/* Interactive Poker Table */}
      <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/30">
        <PokerTable 
          players={players}
          getCurrencySymbol={getCurrencySymbol}
          gameFormat={formData.gameFormat}
          onUpdatePlayer={handleUpdatePlayer}
          onRemovePlayer={handleRemovePlayer}
          availablePositions={getAvailablePositions(players, '')}
          isPositionsStep={true}
        />
      </div>

      {/* Instructions */}
      <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-600/30">
        <h4 className="text-sm font-medium text-slate-200 mb-2">Instructions</h4>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• Click on empty positions (dotted circles) to add new players</li>
          <li>• Click on existing players to edit their name, stack size, or hero status</li>
          <li>• Set one player as "Hero" - this will be your position in the hand</li>
          <li>• You need at least 2 players to continue to the next step</li>
        </ul>
      </div>
    </div>
  );
};

export default PositionsStep;
