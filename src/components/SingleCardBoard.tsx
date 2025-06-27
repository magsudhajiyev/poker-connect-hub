import { Label } from '@/components/ui/label';
import { CardFromString, PlayingCard, type CardRank } from '@/components/ui/playing-card';

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

  const getSuitName = (suitSymbol: string) => {
    const suitMap: { [key: string]: 'spades' | 'hearts' | 'diamonds' | 'clubs' } = {
      '♠': 'spades',
      '♥': 'hearts',
      '♦': 'diamonds',
      '♣': 'clubs',
    };
    return suitMap[suitSymbol];
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
                const suitName = getSuitName(suit);

                return (
                  <div key={card} className="relative">
                    <PlayingCard
                      rank={rank as CardRank}
                      suit={suitName}
                      size="sm"
                      onClick={() => handleCardClick(rank, suit)}
                      selected={isSelected}
                      className="cursor-pointer hover:scale-105 transition-transform"
                    />
                  </div>
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
              <CardFromString key={index} card={card} size="md" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleCardBoard;
