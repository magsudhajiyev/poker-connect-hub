
import React from 'react';
import CardInput from '@/components/CardInput';
import SelectedCardsDisplay from './SelectedCardsDisplay';

interface CommunityCardsProps {
  formData: any;
  setFormData: (data: any) => void;
  currentStep: number;
}

const CommunityCards = ({ formData, setFormData, currentStep }: CommunityCardsProps) => {
  const getAllSelectedCards = () => {
    return [
      ...formData.holeCards,
      ...formData.flopCards,
      ...formData.turnCard,
      ...formData.riverCard
    ];
  };

  if (currentStep < 3) {
    // Before flop - show placeholder
    return (
      <div className="flex space-x-2 items-center justify-center">
        <div className="text-white/60 text-sm font-medium">Community Cards</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="flex space-x-2 items-center">
        {/* Flop Cards */}
        {currentStep >= 3 && (
          <>
            {formData.flopCards.length > 0 ? (
              <SelectedCardsDisplay cards={formData.flopCards} label="" />
            ) : (
              <CardInput
                label=""
                cards={formData.flopCards}
                onCardsChange={(cards) => setFormData({...formData, flopCards: cards})}
                maxCards={3}
                placeholder="Flop"
                excludeCards={getAllSelectedCards().filter(card => !formData.flopCards.includes(card))}
              />
            )}
          </>
        )}

        {/* Turn Card */}
        {currentStep >= 4 && (
          <>
            {formData.turnCard.length > 0 ? (
              <SelectedCardsDisplay cards={formData.turnCard} label="" />
            ) : (
              <CardInput
                label=""
                cards={formData.turnCard}
                onCardsChange={(cards) => setFormData({...formData, turnCard: cards})}
                maxCards={1}
                placeholder="Turn"
                excludeCards={getAllSelectedCards().filter(card => !formData.turnCard.includes(card))}
              />
            )}
          </>
        )}

        {/* River Card */}
        {currentStep >= 5 && (
          <>
            {formData.riverCard.length > 0 ? (
              <SelectedCardsDisplay cards={formData.riverCard} label="" />
            ) : (
              <CardInput
                label=""
                cards={formData.riverCard}
                onCardsChange={(cards) => setFormData({...formData, riverCard: cards})}
                maxCards={1}
                placeholder="River"
                excludeCards={getAllSelectedCards().filter(card => !formData.riverCard.includes(card))}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommunityCards;
