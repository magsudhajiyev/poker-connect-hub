
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CardInput from '@/components/CardInput';
import PotDisplay from './PotDisplay';
import ActionFlow from './ActionFlow';

interface PreflopStepProps {
  formData: any;
  setFormData: (data: any) => void;
  showPot: boolean;
  getPositionName: (position: string) => string;
  getCurrencySymbol: () => string;
  calculatePotSize: () => number;
  getAvailableActions: (street: string, index: number) => string[];
  updateAction: (street: any, index: number, action: string, betAmount?: string) => void;
  getActionButtonClass: (action: string, isSelected: boolean) => string;
  handleBetSizeSelect: (street: any, index: number, amount: string) => void;
  getAllSelectedCards: () => string[];
}

const PreflopStep = ({ 
  formData, 
  setFormData, 
  showPot, 
  getPositionName, 
  getCurrencySymbol, 
  calculatePotSize, 
  getAvailableActions, 
  updateAction, 
  getActionButtonClass, 
  handleBetSizeSelect,
  getAllSelectedCards
}: PreflopStepProps) => {
  const potSize = calculatePotSize();

  return (
    <div className="space-y-4 sm:space-y-6">
      {showPot && (
        <PotDisplay potSize={potSize} getCurrencySymbol={getCurrencySymbol} />
      )}

      <h3 className="text-base sm:text-lg font-medium text-slate-200 mb-3 sm:mb-4">Preflop Action</h3>
      
      <CardInput
        label="Hole Cards"
        cards={formData.holeCards}
        onCardsChange={(cards) => setFormData({...formData, holeCards: cards})}
        maxCards={2}
        placeholder="Type your hole cards (e.g., Ah, 7d)"
        excludeCards={getAllSelectedCards().filter(card => !formData.holeCards.includes(card))}
      />
      
      <ActionFlow
        street="preflopActions"
        formData={formData}
        getPositionName={getPositionName}
        getCurrencySymbol={getCurrencySymbol}
        calculatePotSize={calculatePotSize}
        getAvailableActions={getAvailableActions}
        updateAction={updateAction}
        getActionButtonClass={getActionButtonClass}
        handleBetSizeSelect={handleBetSizeSelect}
      />

      <div>
        <Label htmlFor="preflop-description" className="text-slate-300 text-sm sm:text-base">Preflop Insights (Optional)</Label>
        <Textarea
          id="preflop-description"
          value={formData.preflopDescription}
          onChange={(e) => setFormData({...formData, preflopDescription: e.target.value})}
          placeholder="Describe your thoughts, reads, or situation before the flop..."
          rows={3}
          className="bg-slate-900/50 border-slate-700/50 text-slate-200 text-sm sm:text-base mt-1 sm:mt-2"
        />
      </div>
    </div>
  );
};

export default PreflopStep;
