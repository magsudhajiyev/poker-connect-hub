
import { getPositionName } from '@/utils/shareHandConstants';

interface Player {
  id: string;
  name: string;
  position: string;
  isHero?: boolean;
}

interface SelectedPositionsDisplayProps {
  players: Player[];
}

const SelectedPositionsDisplay = ({ players }: SelectedPositionsDisplayProps) => {
  if (!players || players.length === 0) return null;

  const playersWithPositions = players.filter(player => player.position);

  if (playersWithPositions.length === 0) return null;

  return (
    <div className="mb-4 p-3 bg-slate-900/30 rounded-lg border border-slate-700/30">
      <h4 className="text-sm font-medium text-slate-200 mb-2">Players & Positions</h4>
      <div className="flex flex-wrap gap-2">
        {playersWithPositions.map((player) => (
          <div
            key={player.id}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              player.isHero
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
            }`}
          >
            {player.name}: {getPositionName(player.position)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedPositionsDisplay;
