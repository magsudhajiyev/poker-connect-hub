
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CardInput from '@/components/CardInput';
import PotDisplay from './PotDisplay';
import { PokerTable } from './poker-table';
import SelectedCardsDisplay from './SelectedCardsDisplay';
import { usePlayerManagement } from '@/hooks/usePlayerManagement';
import { getAvailablePositions } from '@/utils/positionUtils';

interface PreflopStepProps {
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
  const { players, updatePlayer, removePlayer } = usePlayerManagement(formData, setFormData);

  // Don't allow player updates in action steps - players should be locked
  const handleUpdatePlayer = (newPlayer: any) => {
    // Do nothing - players are locked after positions step
    console.log('Player updates disabled in action steps');
  };

  const handleRemovePlayer = (playerId: string) => {
    // Do nothing - players are locked after positions step
    console.log('Player removal disabled in action steps');
  };

  return (
    <div className="space-y-4">
      {showPot && (
        <PotDisplay potSize={potSize} getCurrencySymbol={getCurrencySymbol} />
      )}

      <h3 className="text-base font-medium text-slate-200 mb-2">Preflop Action</h3>
      
      <div className="space-y-3">
        <CardInput
          label="Hole Cards"
          cards={formData.holeCards}
          onCardsChange={(cards) => setFormData({...formData, holeCards: cards})}
          maxCards={2}
          placeholder="Type your hole cards (e.g., Ah, 7d)"
          excludeCards={getAllSelectedCards().filter(card => !formData.holeCards.includes(card))}
        />

        {formData.holeCards.length > 0 && (
          <SelectedCardsDisplay cards={formData.holeCards} label="Your Hole Cards" />
        )}
      </div>

      {/* Interactive Poker Table with Actions */}
      <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/30">
        <PokerTable 
          players={players}
          getCurrencySymbol={getCurrencySymbol}
          gameFormat={formData.gameFormat}
          onUpdatePlayer={handleUpdatePlayer}
          onRemovePlayer={handleRemovePlayer}
          availablePositions={getAvailablePositions(players, '')}
          currentStreet="preflopActions"
          formData={formData}
          getAvailableActions={getAvailableActions}
          updateAction={updateAction}
          handleBetSizeSelect={handleBetSizeSelect}
          isPositionsStep={false}
        />
      </div>

      <div>
        <Label htmlFor="preflop-description" className="text-slate-300 text-sm">Preflop Insights (Optional)</Label>
        <Textarea
          id="preflop-description"
          value={formData.preflopDescription}
          onChange={(e) => setFormData({...formData, preflopDescription: e.target.value})}
          placeholder="Describe your thoughts, reads, or situation before the flop..."
          rows={2}
          className="bg-slate-900/50 border-slate-700/50 text-slate-200 text-sm mt-1"
        />
      </div>
    </div>
  );
};

export default PreflopStep;
