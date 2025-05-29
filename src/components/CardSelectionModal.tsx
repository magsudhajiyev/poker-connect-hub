
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface CardSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (cards: string[]) => void;
  title: string;
  maxCards: number;
  disabledCards: string[];
  currentSelection?: string[];
}

const CardSelectionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  maxCards, 
  disabledCards,
  currentSelection = []
}: CardSelectionModalProps) => {
  const [selectedCards, setSelectedCards] = useState<string[]>(currentSelection);
  
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
  const suits = ['♠', '♥', '♦', '♣'];

  const handleCardClick = (rank: string, suit: string) => {
    const card = rank + suit;
    
    if (disabledCards.includes(card)) return;
    
    if (selectedCards.includes(card)) {
      // Remove card if already selected
      setSelectedCards(selectedCards.filter(c => c !== card));
    } else if (selectedCards.length < maxCards) {
      // Add card if under limit
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedCards);
    onClose();
  };

  const handleCancel = () => {
    setSelectedCards(currentSelection);
    onClose();
  };

  const isCardDisabled = (card: string) => {
    return disabledCards.includes(card);
  };

  const isCardSelected = (card: string) => {
    return selectedCards.includes(card);
  };

  const getButtonColor = (suit: string, isSelected: boolean, isDisabled: boolean) => {
    const isRedSuit = suit === '♥' || suit === '♦';
    
    if (isDisabled) {
      return 'bg-slate-700 text-slate-500 border-slate-600 cursor-not-allowed';
    }
    
    if (isSelected) {
      return isRedSuit ? 'bg-emerald-500 text-red-600 border-emerald-500' : 'bg-emerald-500 text-slate-900 border-emerald-500';
    }
    
    return isRedSuit ? 'border-slate-700/50 text-red-400 hover:bg-slate-800/50' : 'border-slate-700/50 text-slate-300 hover:bg-slate-800/50';
  };

  const getCardColor = (card: string) => {
    const suit = card.slice(-1);
    return suit === '♥' || suit === '♦' ? 'text-red-400' : 'text-white';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-200">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-slate-400">
            Select {maxCards} card{maxCards > 1 ? 's' : ''} ({selectedCards.length}/{maxCards} selected)
          </div>
          
          {/* Card Grid - Made more compact */}
          <div className="border border-slate-700/50 rounded-lg p-4 bg-slate-800/30 max-h-80 overflow-y-auto">
            <div className="space-y-2">
              {suits.map((suit) => (
                <div key={suit} className="flex gap-1 flex-wrap">
                  {ranks.map((rank) => {
                    const card = rank + suit;
                    const isSelected = isCardSelected(card);
                    const isDisabled = isCardDisabled(card);
                    
                    return (
                      <Button
                        key={card}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleCardClick(rank, suit)}
                        disabled={isDisabled}
                        className={`w-10 h-14 text-lg font-bold ${getButtonColor(suit, isSelected, isDisabled)}`}
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
                  <div key={index} className={`w-12 h-16 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center font-bold text-xl ${getCardColor(card)}`}>
                    {card}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} className="border-slate-700/50 text-slate-300">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={selectedCards.length !== maxCards}
            className="bg-emerald-500 text-slate-900 hover:bg-emerald-600"
          >
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CardSelectionModal;
