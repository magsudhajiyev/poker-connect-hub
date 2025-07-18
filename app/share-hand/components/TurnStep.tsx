'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CardInput from '@/components/CardInput';
import { LazyPokerTable as PokerTable } from './lazy-components';
import SelectedCardsDisplay from './SelectedCardsDisplay';
import { usePlayerManagement } from '@/hooks/usePlayerManagement';
import { getAvailablePositions } from '@/utils/positionUtils';

interface TurnStepProps {
  formData: any;
  setFormData: (data: any) => void;
  getCurrencySymbol: () => string;
  getAvailableActions: (street: string, index: number, allActions: any[]) => string[];
  updateAction: (street: any, index: number, action: string, betAmount?: string) => void;
  handleBetSizeSelect: (street: any, index: number, amount: string) => void;
  getAllSelectedCards: () => string[];
  pot?: number;
}

const TurnStep = ({
  formData,
  setFormData,
  getCurrencySymbol,
  getAvailableActions,
  updateAction,
  handleBetSizeSelect,
  getAllSelectedCards,
  pot,
}: TurnStepProps) => {
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
      <h3 className="text-base font-medium text-slate-200 mb-2">Turn</h3>

      <div className="space-y-3">
        <div className="flex flex-wrap items-start gap-3">
          <SelectedCardsDisplay cards={formData.holeCards} label="Your Hole Cards" />
          <SelectedCardsDisplay cards={formData.flopCards} label="Flop" />

          <CardInput
            label="Turn Card"
            cards={formData.turnCard}
            onCardsChange={(cards) => setFormData({ ...formData, turnCard: cards })}
            maxCards={1}
            placeholder="Type turn card (e.g., 2h)"
            excludeCards={getAllSelectedCards().filter((card) => !formData.turnCard.includes(card))}
          />
        </div>
      </div>

      {/* Interactive Poker Table with Actions */}
      <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/30">
        <PokerTable
          players={players}
          communityCards={[...formData.flopCards, ...formData.turnCard]}
          getCurrencySymbol={getCurrencySymbol}
          gameFormat={formData.gameFormat}
          onUpdatePlayer={handleUpdatePlayer}
          onRemovePlayer={handleRemovePlayer}
          availablePositions={getAvailablePositions(players, '')}
          currentStreet="turnActions"
          formData={formData}
          getAvailableActions={getAvailableActions}
          updateAction={updateAction}
          handleBetSizeSelect={handleBetSizeSelect}
          isPositionsStep={false}
          pot={pot}
        />
      </div>

      <div>
        <Label htmlFor="turn-description" className="text-slate-300 text-sm">
          Turn Insights (Optional)
        </Label>
        <Textarea
          id="turn-description"
          value={formData.turnDescription}
          onChange={(e) => setFormData({ ...formData, turnDescription: e.target.value })}
          placeholder="How did the turn card change the dynamics? Your reasoning for the action..."
          rows={2}
          className="bg-slate-900/50 border-slate-700/50 text-slate-200 text-sm mt-1"
        />
      </div>
    </div>
  );
};

export default TurnStep;
