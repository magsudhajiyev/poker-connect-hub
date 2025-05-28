
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CardInput from '@/components/CardInput';
import PotDisplay from './PotDisplay';
import ActionFlow from './ActionFlow';
import SelectedCardsDisplay from './SelectedCardsDisplay';

interface FlopStepProps {
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

const FlopStep = ({ 
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
}: FlopStepProps) => {
  const potSize = calculatePotSize();

  return (
    <div className="space-y-6">
      {showPot && (
        <PotDisplay potSize={potSize} getCurrencySymbol={getCurrencySymbol} />
      )}

      <h3 className="text-lg font-medium text-slate-200 mb-4">Flop</h3>
      
      <div className="space-y-4">
        <SelectedCardsDisplay cards={formData.holeCards} label="Your Hole Cards" />
        
        <CardInput
          label="Flop Cards"
          cards={formData.flopCards}
          onCardsChange={(cards) => setFormData({...formData, flopCards: cards})}
          maxCards={3}
          placeholder="Type flop cards (e.g., Kh, 9s, 4d)"
          excludeCards={getAllSelectedCards().filter(card => !formData.flopCards.includes(card))}
        />
      </div>

      <ActionFlow
        street="flopActions"
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
        <Label htmlFor="flop-description" className="text-slate-300">Flop Insights (Optional)</Label>
        <Textarea
          id="flop-description"
          value={formData.flopDescription}
          onChange={(e) => setFormData({...formData, flopDescription: e.target.value})}
          placeholder="Describe your thoughts about this flop texture, your hand strength, reads..."
          rows={3}
          className="bg-slate-900/50 border-slate-700/50 text-slate-200"
        />
      </div>
    </div>
  );
};

export default FlopStep;
