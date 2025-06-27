'use client';

import { Label } from '@/components/ui/label';
import { CardFromString } from '@/components/ui/playing-card';

interface SelectedCardsDisplayProps {
  cards: string[];
  label: string;
}

const SelectedCardsDisplay = ({ cards, label }: SelectedCardsDisplayProps) => {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label className="text-slate-300">{label}:</Label>
      <div className="flex flex-wrap gap-2">
        {cards.map((card, index) => (
          <CardFromString key={index} card={card} size="md" />
        ))}
      </div>
    </div>
  );
};

export default SelectedCardsDisplay;
