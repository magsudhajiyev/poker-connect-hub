
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface CardSelectorProps {
  label: string;
  value: string;
  onChange: (card: string) => void;
  disabledCards?: string[];
}

const CardSelector = ({ label, value, onChange, disabledCards = [] }: CardSelectorProps) => {
  const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
  const suits = ['♠', '♥', '♦', '♣'];

  const currentCard = value || '';
  const [rank, suit] = currentCard ? [currentCard.slice(0, -1), currentCard.slice(-1)] : ['', ''];

  const isCardDisabled = (card: string) => {
    return disabledCards.includes(card);
  };

  const getSuitColor = (suitSymbol: string, isSelected: boolean) => {
    const isRedSuit = suitSymbol === '♥' || suitSymbol === '♦';
    if (isSelected) {
      return 'bg-emerald-500 text-slate-900';
    }
    return isRedSuit ? 'border-slate-700/50 text-red-500' : 'border-slate-700/50 text-slate-300';
  };

  const getCardDisplayColor = () => {
    return suit === '♥' || suit === '♦' ? 'text-red-500' : 'text-white';
  };

  return (
    <div className="space-y-3">
      <Label className="text-slate-300">{label}</Label>
      
      {/* Rank Selection */}
      <div>
        <div className="text-sm text-slate-400 mb-2">Rank</div>
        <div className="grid grid-cols-7 gap-2">
          {cards.map((card) => (
            <Button
              key={card}
              variant={rank === card ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const newCard = card + (suit || '♠');
                onChange(newCard);
              }}
              className={`aspect-square text-lg font-bold ${
                rank === card 
                  ? 'bg-emerald-500 text-slate-900' 
                  : 'border-slate-700/50 text-slate-300'
              }`}
            >
              {card}
            </Button>
          ))}
        </div>
      </div>

      {/* Suit Selection */}
      <div>
        <div className="text-sm text-slate-400 mb-2">Suit</div>
        <div className="grid grid-cols-4 gap-2">
          {suits.map((suitSymbol) => {
            const potentialCard = (rank || 'A') + suitSymbol;
            const isDisabled = isCardDisabled(potentialCard);
            
            return (
              <Button
                key={suitSymbol}
                variant={suit === suitSymbol ? 'default' : 'outline'}
                size="sm"
                disabled={isDisabled}
                onClick={() => {
                  const newCard = (rank || 'A') + suitSymbol;
                  if (!isDisabled) {
                    onChange(newCard);
                  }
                }}
                className={`aspect-square text-2xl font-bold ${getSuitColor(suitSymbol, suit === suitSymbol)} ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {suitSymbol}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Selected Card Display */}
      {currentCard && (
        <div className="mt-3">
          <div className={`inline-flex items-center justify-center w-16 h-20 bg-slate-800 border-2 border-slate-600 rounded-lg text-2xl font-bold ${getCardDisplayColor()}`}>
            {currentCard}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardSelector;
