
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { usePlayerManagement } from '@/hooks/usePlayerManagement';
import { getAvailablePositions } from '@/utils/positionUtils';
import PlayerRow from './PlayerRow';

interface PositionsStepProps {
  formData: any;
  setFormData: (data: any) => void;
  showValidationErrors?: boolean;
}

const PositionsStep = ({ formData, setFormData, showValidationErrors = false }: PositionsStepProps) => {
  const { players, updatePlayer, addPlayer, removePlayer } = usePlayerManagement(formData, setFormData);

  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium text-slate-200 mb-3">Player Positions & Stack Sizes</h3>

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
          {players.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              gameFormat={formData.gameFormat}
              availablePositions={getAvailablePositions(players, player.id)}
              showValidationErrors={showValidationErrors}
              onUpdatePlayer={updatePlayer}
              onRemovePlayer={removePlayer}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PositionsStep;
