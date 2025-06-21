
import { useState, useRef } from 'react';

const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
const suits = ['♠', '♥', '♦', '♣'];
const suitMap: { [key: string]: string } = {
  's': '♠', 'spades': '♠',
  'h': '♥', 'hearts': '♥',
  'd': '♦', 'diamonds': '♦',
  'c': '♣', 'clubs': '♣',
};

export const useCardInput = (cards: string[], excludeCards: string[] = []) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const allCards = ranks.flatMap(rank => suits.map(suit => rank + suit));

  const getSuggestions = (input: string) => {
    if (!input.trim()) {
return [];
}
    
    const normalizedInput = input.toLowerCase().replace(/[,\s]+/g, '');
    const allExcludedCards = [...cards, ...excludeCards];
    
    return allCards.filter(card => {
      if (allExcludedCards.includes(card)) {
return false;
}
      
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

  const parseCardInput = (input: string): string[] => {
    const parts = input.split(/[,\s]+/).filter(part => part.trim());
    const parsedCards: string[] = [];
    const allExcludedCards = [...cards, ...excludeCards];

    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.length >= 2) {
        const rank = trimmed[0].toUpperCase();
        const suitChar = trimmed.slice(1).toLowerCase();
        
        if (ranks.includes(rank)) {
          const suit = suitMap[suitChar] || suits.find(s => s === trimmed[1]);
          if (suit) {
            const card = rank + suit;
            if (!parsedCards.includes(card) && !allExcludedCards.includes(card)) {
              parsedCards.push(card);
            }
          }
        }
      }
    }

    return parsedCards;
  };

  return {
    inputValue,
    setInputValue,
    showSuggestions,
    setShowSuggestions,
    selectedSuggestionIndex,
    setSelectedSuggestionIndex,
    inputRef,
    getSuggestions,
    parseCardInput,
  };
};
