
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface CardInputProps {
  label: string;
  cards: string[];
  onCardsChange: (cards: string[]) => void;
  maxCards: number;
  placeholder?: string;
}

const CardInput = ({ label, cards, onCardsChange, maxCards, placeholder }: CardInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
  const suits = ['♠', '♥', '♦', '♣'];
  const suitMap: { [key: string]: string } = {
    's': '♠', 'spades': '♠',
    'h': '♥', 'hearts': '♥',
    'd': '♦', 'diamonds': '♦',
    'c': '♣', 'clubs': '♣'
  };

  // Generate all possible cards
  const allCards = ranks.flatMap(rank => suits.map(suit => rank + suit));

  // Filter suggestions based on input
  const getSuggestions = (input: string) => {
    if (!input.trim()) return [];
    
    const normalizedInput = input.toLowerCase().replace(/[,\s]+/g, '');
    
    return allCards.filter(card => {
      const normalizedCard = card.toLowerCase();
      const cardWithTextSuit = card.replace(/[♠♥♦♣]/g, (suit) => {
        const suitName = { '♠': 's', '♥': 'h', '♦': 'd', '♣': 'c' }[suit];
        return suitName || suit;
      }).toLowerCase();
      
      return normalizedCard.includes(normalizedInput) || 
             cardWithTextSuit.includes(normalizedInput) ||
             card.toLowerCase().startsWith(normalizedInput);
    }).slice(0, 10);
  };

  const suggestions = getSuggestions(inputValue);

  const parseCardInput = (input: string): string[] => {
    const parts = input.split(/[,\s]+/).filter(part => part.trim());
    const parsedCards: string[] = [];

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.length >= 2) {
        const rank = trimmed[0].toUpperCase();
        const suitChar = trimmed.slice(1).toLowerCase();
        
        if (ranks.includes(rank)) {
          const suit = suitMap[suitChar] || suits.find(s => s === trimmed[1]);
          if (suit) {
            const card = rank + suit;
            if (!parsedCards.includes(card)) {
              parsedCards.push(card);
            }
          }
        }
      }
    }

    return parsedCards;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.length > 0);
    setSelectedSuggestionIndex(-1);

    // Auto-parse cards as user types
    const parsedCards = parseCardInput(value);
    if (parsedCards.length > 0 && parsedCards.length <= maxCards) {
      onCardsChange(parsedCards);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const selectSuggestion = (card: string) => {
    if (cards.length < maxCards && !cards.includes(card)) {
      const newCards = [...cards, card];
      onCardsChange(newCards);
      
      // Clear input and hide suggestions
      setInputValue('');
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const removeCard = (cardToRemove: string) => {
    onCardsChange(cards.filter(card => card !== cardToRemove));
  };

  const handleInputFocus = () => {
    if (inputValue.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  };

  // Reset input when cards are cleared externally
  useEffect(() => {
    if (cards.length === 0) {
      setInputValue('');
    }
  }, [cards]);

  return (
    <div className="space-y-3">
      <Label className="text-slate-300">{label}</Label>
      
      {/* Selected Cards Display */}
      {cards.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {cards.map((card, index) => (
            <div key={index} className="relative group">
              <div className={`w-10 h-12 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center font-bold text-xs ${
                card.includes('♥') || card.includes('♦') ? 'text-red-400' : 'text-slate-200'
              }`}>
                {card}
              </div>
              <button
                onClick={() => removeCard(card)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2 h-2 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Field */}
      {cards.length < maxCards && (
        <div className="relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder || `Type cards (e.g., "Ah, 7d")`}
            className="bg-slate-900/50 border-slate-700/50 text-slate-200"
          />
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {suggestions.map((card, index) => (
                <button
                  key={card}
                  onClick={() => selectSuggestion(card)}
                  className={`w-full px-3 py-2 text-left hover:bg-slate-700 transition-colors ${
                    index === selectedSuggestionIndex ? 'bg-slate-700' : ''
                  } ${
                    card.includes('♥') || card.includes('♦') ? 'text-red-400' : 'text-slate-200'
                  }`}
                >
                  <span className="font-mono font-bold">{card}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Card Counter */}
      <div className="text-xs text-slate-400">
        {cards.length}/{maxCards} card{maxCards > 1 ? 's' : ''} selected
      </div>
    </div>
  );
};

export default CardInput;
