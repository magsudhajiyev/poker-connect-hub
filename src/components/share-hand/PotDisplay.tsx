
interface PotDisplayProps {
  potSize: number;
  getCurrencySymbol: () => string;
  isFinal?: boolean;
}

const PotDisplay = ({ potSize, getCurrencySymbol, isFinal = false }: PotDisplayProps) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
      <div className="text-center">
        <span className="text-slate-300">{isFinal ? 'Final' : 'Current'} Pot: </span>
        <span className="text-emerald-400 font-bold text-lg">
          {getCurrencySymbol()}{potSize.toFixed(1)}
        </span>
      </div>
    </div>
  );
};

export default PotDisplay;
