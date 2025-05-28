
import { X } from 'lucide-react';

interface CardDisplayProps {
  cards: string[];
  onRemoveCard: (card: string) => void;
}

const CardDisplay = ({ cards, onRemoveCard }: CardDisplayProps) => {
  if (cards.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {cards.map((card, index) => (
        <div key={index} className="relative group">
          <div className={`w-10 h-12 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center font-bold text-xs ${
            card.includes('♥') || card.includes('♦') ? 'text-red-400' : 'text-slate-200'
          }`}>
            {card}
          </div>
          <button
            onClick={() => onRemoveCard(card)}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-2 h-2 text-white" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default CardDisplay;
