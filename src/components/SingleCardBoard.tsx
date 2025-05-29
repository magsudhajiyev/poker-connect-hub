
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface SingleCardBoardProps {
  selectedCards: string[];
  onCardSelect: (card: string) => void;
  title: string;
}

const SingleCardBoard = ({ selectedCards, onCardSelect, title }: SingleCardBoardProps) => {
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
  const suits = ['♠', '♥', '♦', '♣'];

  const isCardSelected = (card: string) => {
    return selectedCards.includes(card);
  };

  const handleCardClick = (rank: string, suit: string) => {
    const card = rank + suit;
    onCardSelect(card);
  };

  return (
    <div className="space-y-4">
      <Label className="text-slate-300 text-lg font-medium">{title}</Label>
      
      {/* Card Grid */}
      <div className="border border-slate-700/50 rounded-lg p-4 bg-slate-800/30">
        <div className="space-y-3">
          {suits.map((suit) => (
            <div key={suit} className="flex gap-2">
              {ranks.map((rank) => {
                const card = rank + suit;
                const isSelected = isCardSelected(card);
                const isRedSuit = suit === '♥' || suit === '♦';
                
                return (
                  <Button
                    key={card}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCardClick(rank, suit)}
                    className={`w-10 h-12 text-sm font-bold ${
                      isSelected 
                        ? 'bg-emerald-500 text-slate-900 border-emerald-500' 
                        : 'border-slate-700/50 text-slate-300 hover:bg-slate-800/50'
                    } ${
                      isRedSuit && !isSelected ? 'text-red-500' : ''
                    } ${
                      isSelected && isRedSuit ? 'text-red-700' : ''
                    }`}
                  >
                    {card}
                  </Button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Cards Display */}
      {selectedCards.length > 0 && (
        <div className="space-y-2">
          <Label className="text-slate-300">Selected Cards:</Label>
          <div className="flex flex-wrap gap-2">
            {selectedCards.map((card, index) => (
              <div key={index} className={`w-12 h-16 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center font-bold text-base ${
                card.includes('♥') || card.includes('♦') ? 'text-red-500' : 'text-white'
              }`}>
                {card}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleCardBoard;
