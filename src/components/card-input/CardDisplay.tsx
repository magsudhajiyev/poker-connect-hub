import { X } from 'lucide-react';
import { CardFromString } from '@/components/ui/playing-card';

interface CardDisplayProps {
  cards: string[];
  onRemoveCard: (card: string) => void;
}

const CardDisplay = ({ cards, onRemoveCard }: CardDisplayProps) => {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {cards.map((card, index) => (
        <div key={index} className="relative group">
          <CardFromString card={card} size="md" className="transition-transform duration-200" />
          <button
            onClick={() => onRemoveCard(card)}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <X className="w-2 h-2 text-white" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default CardDisplay;
