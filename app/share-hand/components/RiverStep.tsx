'use client';


import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import CardInput from '@/components/CardInput';
import { PokerTable } from './poker-table';
import { useShareHandContext } from './ShareHandProvider';
import SelectedCardsDisplay from './SelectedCardsDisplay';
import { usePlayerManagement } from '@/hooks/usePlayerManagement';
import { getAvailablePositions } from '@/utils/positionUtils';

interface RiverStepProps {
  formData: any;
  setFormData: (data: any) => void;
  showPot: boolean;
  tags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  getPositionName: (position: string) => string;
  getCurrencySymbol: () => string;
  calculatePotSize: () => number;
  getAvailableActions: (street: string, index: number, allActions: any[]) => string[];
  updateAction: (street: any, index: number, action: string, betAmount?: string) => void;
  getActionButtonClass: (action: string, isSelected: boolean) => string;
  handleBetSizeSelect: (street: any, index: number, amount: string) => void;
  getAllSelectedCards: () => string[];
}

const RiverStep = ({ 
  formData, 
  setFormData, 
  showPot, 
  tags, 
  addTag, 
  removeTag, 
  getPositionName, 
  getCurrencySymbol, 
  calculatePotSize, 
  getAvailableActions, 
  updateAction, 
  getActionButtonClass, 
  handleBetSizeSelect,
  getAllSelectedCards,
}: RiverStepProps) => {
  const { players, updatePlayer, removePlayer } = usePlayerManagement(formData, setFormData);
  const { pokerActions } = useShareHandContext();
  const potSize = pokerActions?.pot || calculatePotSize(formData);

  // Don't allow player updates in action steps - players should be locked
  const handleUpdatePlayer = (newPlayer: any) => {
    // Do nothing - players are locked after positions step
  };

  const handleRemovePlayer = (playerId: string) => {
    // Do nothing - players are locked after positions step
  };

  return (
    <div className="space-y-4">

      <h3 className="text-base font-medium text-slate-200 mb-2">River & Summary</h3>
      
      <div className="space-y-3">
        <div className="flex flex-wrap items-start gap-3">
          <SelectedCardsDisplay cards={formData.holeCards} label="Your Hole Cards" />
          <SelectedCardsDisplay cards={formData.flopCards} label="Flop" />
          <SelectedCardsDisplay cards={formData.turnCard} label="Turn" />
          
          <CardInput
            label="River Card"
            cards={formData.riverCard}
            onCardsChange={(cards) => setFormData({...formData, riverCard: cards})}
            maxCards={1}
            placeholder="Type river card (e.g., As)"
            excludeCards={getAllSelectedCards().filter(card => !formData.riverCard.includes(card))}
          />
        </div>
      </div>

      {/* Interactive Poker Table with Actions */}
      <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/30">
        <PokerTable 
          players={players}
          communityCards={[...formData.flopCards, ...formData.turnCard, ...formData.riverCard]}
          getCurrencySymbol={getCurrencySymbol}
          gameFormat={formData.gameFormat}
          onUpdatePlayer={handleUpdatePlayer}
          onRemovePlayer={handleRemovePlayer}
          availablePositions={getAvailablePositions(players, '')}
          currentStreet="riverActions"
          formData={formData}
          getAvailableActions={getAvailableActions}
          updateAction={updateAction}
          handleBetSizeSelect={handleBetSizeSelect}
          isPositionsStep={false}
          pokerActions={pokerActions}
        />
      </div>

      <div>
        <Label htmlFor="riverDescription" className="text-slate-300 text-sm">River Analysis</Label>
        <Textarea
          id="riverDescription"
          value={formData.riverDescription}
          onChange={(e) => setFormData({...formData, riverDescription: e.target.value})}
          placeholder="Analysis of river play, thoughts on the spot..."
          rows={2}
          className="bg-slate-900/50 border-slate-700/50 text-slate-200 text-sm mt-1"
        />
      </div>

      <div>
        <Label htmlFor="title" className="text-slate-300 text-sm">Hand Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Give your hand a catchy title"
          className="bg-slate-900/50 border-slate-700/50 text-slate-200 h-9 mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-slate-300 text-sm">Hand Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Overall summary, final thoughts, outcome, what you learned..."
          rows={3}
          className="bg-slate-900/50 border-slate-700/50 text-slate-200 text-sm mt-1"
        />
      </div>

      <div>
        <Label className="text-slate-300 mb-2 block text-sm">Tags</Label>
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-emerald-500/10 text-emerald-400 text-xs">
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-red-400"
              >
                <X className="w-2 h-2" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag"
            className="bg-slate-900/50 border-slate-700/50 text-slate-200 h-9"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addTag(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <Button variant="outline" size="sm" className="border-slate-700/50 text-slate-300 h-9">
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RiverStep;
