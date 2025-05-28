
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CardDisplay from './card-input/CardDisplay';
import CardSuggestions from './card-input/CardSuggestions';
import { useCardInput } from './card-input/useCardInput';

interface CardInputProps {
  label: string;
  cards: string[];
  onCardsChange: (cards: string[]) => void;
  maxCards: number;
  placeholder?: string;
  excludeCards?: string[];
}

const CardInput = ({ label, cards, onCardsChange, maxCards, placeholder, excludeCards = [] }: CardInputProps) => {
  const {
    inputValue,
    setInputValue,
    showSuggestions,
    setShowSuggestions,
    selectedSuggestionIndex,
    setSelectedSuggestionIndex,
    inputRef,
    getSuggestions,
    parseCardInput
  } = useCardInput(cards, excludeCards);

  const suggestions = getSuggestions(inputValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.length > 0);
    setSelectedSuggestionIndex(-1);

    if (cards.length < maxCards && value.trim()) {
      const parsedCards = parseCardInput(value);
      if (parsedCards.length > 0) {
        const combinedCards = [...cards];
        for (const newCard of parsedCards) {
          if (combinedCards.length < maxCards && !combinedCards.includes(newCard)) {
            combinedCards.push(newCard);
          }
        }
        if (combinedCards.length !== cards.length) {
          onCardsChange(combinedCards);
          setInputValue('');
          setShowSuggestions(false);
        }
      }
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
    const allExcludedCards = [...cards, ...excludeCards];
    if (cards.length < maxCards && !allExcludedCards.includes(card)) {
      const newCards = [...cards, card];
      onCardsChange(newCards);
      
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
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  };

  useEffect(() => {
    if (cards.length === 0) {
      setInputValue('');
    }
  }, [cards]);

  return (
    <div className="space-y-3">
      <Label className="text-slate-300">{label}</Label>
      
      <CardDisplay cards={cards} onRemoveCard={removeCard} />

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
          
          <CardSuggestions
            suggestions={suggestions}
            selectedIndex={selectedSuggestionIndex}
            onSelectSuggestion={selectSuggestion}
            show={showSuggestions}
          />
        </div>
      )}

      <div className="text-xs text-slate-400">
        {cards.length}/{maxCards} card{maxCards > 1 ? 's' : ''} selected
      </div>
    </div>
  );
};

export default CardInput;
