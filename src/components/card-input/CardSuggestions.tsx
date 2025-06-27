import { CardFromString } from '@/components/ui/playing-card';

interface CardSuggestionsProps {
  suggestions: string[];
  selectedIndex: number;
  onSelectSuggestion: (card: string) => void;
  show: boolean;
}

const CardSuggestions = ({
  suggestions,
  selectedIndex,
  onSelectSuggestion,
  show,
}: CardSuggestionsProps) => {
  if (!show || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
      {suggestions.map((card, index) => (
        <button
          key={card}
          onClick={() => onSelectSuggestion(card)}
          className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-700 transition-colors ${
            index === selectedIndex ? 'bg-slate-700' : ''
          }`}
        >
          <CardFromString card={card} size="xs" className="flex-shrink-0" />
          <span className="font-mono font-bold text-slate-200">{card}</span>
        </button>
      ))}
    </div>
  );
};

export default CardSuggestions;
