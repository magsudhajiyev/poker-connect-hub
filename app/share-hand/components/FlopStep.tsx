'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CardInput from '@/components/CardInput';
import { LazyPokerTable as PokerTable } from './lazy-components';
import SelectedCardsDisplay from './SelectedCardsDisplay';
import { usePlayerManagement } from '@/hooks/usePlayerManagement';
import { getAvailablePositions } from '@/utils/positionUtils';
import { useShareHandContext } from './ShareHandProvider';

interface FlopStepProps {
  formData: any;
  setFormData: (data: any) => void;
  getCurrencySymbol: () => string;
  getAvailableActions: (street: string, index: number, allActions: any[]) => string[];
  updateAction: (street: any, index: number, action: string, betAmount?: string) => void;
  handleBetSizeSelect: (street: any, index: number, amount: string) => void;
  getAllSelectedCards: () => string[];
  pot?: number;
}

const FlopStep = ({
  formData,
  setFormData,
  getCurrencySymbol,
  getAvailableActions,
  updateAction,
  handleBetSizeSelect,
  getAllSelectedCards,
  pot,
}: FlopStepProps) => {
  // Get players from formData first
  const { players: managedPlayers } = usePlayerManagement(formData, setFormData);
  
  // Try to get players from context if available
  let contextPlayers: any[] | undefined;
  try {
    const context = useShareHandContext();
    contextPlayers = context.players;
  } catch {
    // Context not available (e.g., in tests)
  }
  
  // Use context players if available and has data, otherwise use managed players
  const players = (contextPlayers && contextPlayers.length > 0) ? contextPlayers : managedPlayers;

  const handleUpdatePlayer = (_newPlayer: any) => {
    // Do nothing - players are locked after positions step
  };

  const handleRemovePlayer = (_playerId: string) => {
    // Do nothing - players are locked after positions step
  };

  return (
    <div className="space-y-4 w-full overflow-x-hidden">
      <h3 className="text-base font-medium text-slate-200 mb-2">Flop</h3>

      <div className="space-y-3 w-full">
        <div className="flex flex-wrap items-start gap-3">
          <SelectedCardsDisplay cards={formData.holeCards} label="Your Hole Cards" />

          <CardInput
            label="Flop Cards"
            cards={formData.flopCards}
            onCardsChange={(cards) => setFormData({ ...formData, flopCards: cards })}
            maxCards={3}
            placeholder="Type flop cards (e.g., Kh, 9s, 4d)"
            excludeCards={getAllSelectedCards().filter(
              (card) => !formData.flopCards.includes(card),
            )}
          />
        </div>
      </div>

      {/* Interactive Poker Table with Actions */}
      <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/30 w-full overflow-x-hidden">
        <PokerTable
          players={players}
          communityCards={formData.flopCards}
          getCurrencySymbol={getCurrencySymbol}
          gameFormat={formData.gameFormat}
          onUpdatePlayer={handleUpdatePlayer}
          onRemovePlayer={handleRemovePlayer}
          availablePositions={getAvailablePositions(players, '')}
          currentStreet="flopActions"
          formData={formData}
          getAvailableActions={getAvailableActions}
          updateAction={updateAction}
          handleBetSizeSelect={handleBetSizeSelect}
          pot={pot}
        />
      </div>

      <div className="w-full">
        <Label htmlFor="flop-description" className="text-slate-300 text-sm">
          Flop Insights (Optional)
        </Label>
        <Textarea
          id="flop-description"
          value={formData.flopDescription}
          onChange={(e) => setFormData({ ...formData, flopDescription: e.target.value })}
          placeholder="Describe your thoughts about this flop texture, your hand strength, reads..."
          rows={2}
          className="bg-slate-900/50 border-slate-700/50 text-slate-200 text-sm mt-1 w-full"
        />
      </div>
    </div>
  );
};

export default FlopStep;
