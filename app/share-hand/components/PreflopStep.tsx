'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CardInput from '@/components/CardInput';
import { LazyPokerTable as PokerTable } from './lazy-components';
import SelectedCardsDisplay from './SelectedCardsDisplay';
import { usePlayerManagement } from '@/hooks/usePlayerManagement';
import { getAvailablePositions } from '@/utils/positionUtils';

interface PreflopStepProps {
  formData: any;
  setFormData: (data: any) => void;
  getCurrencySymbol: () => string;
  getAvailableActions: (street: string, index: number, allActions: any[]) => string[];
  updateAction: (street: any, index: number, action: string, betAmount?: string) => void;
  handleBetSizeSelect: (street: any, index: number, amount: string) => void;
  getAllSelectedCards: () => string[];
  pot?: number;
}

const PreflopStep = ({
  formData,
  setFormData,
  getCurrencySymbol,
  getAvailableActions,
  updateAction,
  handleBetSizeSelect,
  getAllSelectedCards,
  pot,
}: PreflopStepProps) => {
  const { players } = usePlayerManagement(formData, setFormData);

  // Don't allow player updates in action steps - players should be locked
  const handleUpdatePlayer = (_newPlayer: any) => {
    // Do nothing - players are locked after positions step
  };

  const handleRemovePlayer = (_playerId: string) => {
    // Do nothing - players are locked after positions step
  };

  return (
    <div className="space-y-4">
      <h3 className="text-base font-medium text-slate-200 mb-2">Preflop Action</h3>

      <div className="space-y-3">
        <CardInput
          label="Hole Cards"
          cards={formData.holeCards}
          onCardsChange={(cards) => setFormData({ ...formData, holeCards: cards })}
          maxCards={2}
          placeholder="Type your hole cards (e.g., Ah, 7d)"
          excludeCards={getAllSelectedCards().filter((card) => !formData.holeCards.includes(card))}
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
          pot={pot}
        />
      </div>

      <div>
        <Label htmlFor="preflop-description" className="text-slate-300 text-sm">
          Preflop Insights (Optional)
        </Label>
        <Textarea
          id="preflop-description"
          value={formData.preflopDescription}
          onChange={(e) => setFormData({ ...formData, preflopDescription: e.target.value })}
          placeholder="Describe your thoughts, reads, or situation before the flop..."
          rows={2}
          className="bg-slate-900/50 border-slate-700/50 text-slate-200 text-sm mt-1"
        />
      </div>
    </div>
  );
};

export default PreflopStep;
