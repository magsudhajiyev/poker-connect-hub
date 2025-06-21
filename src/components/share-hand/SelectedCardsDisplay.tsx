
import { Label } from '@/components/ui/label';

interface SelectedCardsDisplayProps {
  cards: string[];
  label: string;
}

const SelectedCardsDisplay = ({ cards, label }: SelectedCardsDisplayProps) => {
  if (cards.length === 0) {
return null;
}
  
  const getCardColor = (card: string) => {
    const suit = card.slice(-1);
    return suit === '♥' || suit === '♦' ? 'text-red-400' : 'text-white';
  };
  
  return (
    <div className="space-y-2">
      <Label className="text-slate-300">{label}:</Label>
      <div className="flex flex-wrap gap-2">
        {cards.map((card, index) => (
          <div key={index} className={`w-12 h-16 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center font-bold text-xl ${getCardColor(card)}`}>
            {card}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectedCardsDisplay;
