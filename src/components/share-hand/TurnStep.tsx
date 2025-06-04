
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CardInput from '@/components/CardInput';
import PotDisplay from './PotDisplay';
import ActionFlow from './ActionFlow';
import SelectedCardsDisplay from './SelectedCardsDisplay';

interface TurnStepProps {
  formData: any;
  setFormData: (data: any) => void;
  showPot: boolean;
  getPositionName: (position: string) => string;
  getCurrencySymbol: () => string;
  calculatePotSize: () => number;
  getAvailableActions: (street: string, index: number, allActions: any[]) => string[];
  updateAction: (street: any, index: number, action: string, betAmount?: string) => void;
  getActionButtonClass: (action: string, isSelected: boolean) => string;
  handleBetSizeSelect: (street: any, index: number, amount: string) => void;
  getAllSelectedCards: () => string[];
}

const TurnStep = ({ 
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
}: TurnStepProps) => {
  const potSize = calculatePotSize();

  return (
    <div className="space-y-3">
      {showPot && (
        <PotDisplay potSize={potSize} getCurrencySymbol={getCurrencySymbol} />
      )}

      <h3 className="text-base font-medium text-slate-200 mb-2">Turn</h3>
      
      <div className="flex flex-wrap items-start gap-3">
        <SelectedCardsDisplay cards={formData.holeCards} label="Your Hole Cards" />
        <SelectedCardsDisplay cards={formData.flopCards} label="Flop" />
        
        <CardInput
          label="Turn Card"
          cards={formData.turnCard}
          onCardsChange={(cards) => setFormData({...formData, turnCard: cards})}
          maxCards={1}
          placeholder="Type turn card (e.g., 2h)"
          excludeCards={getAllSelectedCards().filter(card => !formData.turnCard.includes(card))}
        />
      </div>

      <ActionFlow
        street="turnActions"
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
        <Label htmlFor="turn-description" className="text-slate-300 text-sm">Turn Insights (Optional)</Label>
        <Textarea
          id="turn-description"
          value={formData.turnDescription}
          onChange={(e) => setFormData({...formData, turnDescription: e.target.value})}
          placeholder="How did the turn card change the dynamics? Your reasoning for the action..."
          rows={2}
          className="bg-slate-900/50 border-slate-700/50 text-slate-200 text-sm mt-1"
        />
      </div>
    </div>
  );
};

export default TurnStep;
