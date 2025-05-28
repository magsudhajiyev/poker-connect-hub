
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import CardInput from '@/components/CardInput';
import PotDisplay from './PotDisplay';
import ActionFlow from './ActionFlow';
import SelectedCardsDisplay from './SelectedCardsDisplay';

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
  getAvailableActions: (street: string, index: number) => string[];
  updateAction: (street: any, index: number, action: string, betAmount?: string) => void;
  getActionButtonClass: (action: string, isSelected: boolean) => string;
  handleBetSizeSelect: (street: any, index: number, amount: string) => void;
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
  handleBetSizeSelect 
}: RiverStepProps) => {
  const potSize = calculatePotSize();

  return (
    <div className="space-y-6">
      {showPot && (
        <PotDisplay potSize={potSize} getCurrencySymbol={getCurrencySymbol} isFinal />
      )}

      <h3 className="text-lg font-medium text-slate-200 mb-4">River & Summary</h3>
      
      <div className="space-y-4">
        <SelectedCardsDisplay cards={formData.holeCards} label="Your Hole Cards" />
        <SelectedCardsDisplay cards={formData.flopCards} label="Flop" />
        <SelectedCardsDisplay cards={formData.turnCard} label="Turn" />
        
        <CardInput
          label="River Card"
          cards={formData.riverCard}
          onCardsChange={(cards) => setFormData({...formData, riverCard: cards})}
          maxCards={1}
          placeholder="Type river card (e.g., As)"
        />
      </div>

      <ActionFlow
        street="riverActions"
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
        <Label htmlFor="title" className="text-slate-300">Hand Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Give your hand a catchy title"
          className="bg-slate-900/50 border-slate-700/50 text-slate-200"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-slate-300">Hand Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Overall summary, final thoughts, outcome, what you learned..."
          rows={4}
          className="bg-slate-900/50 border-slate-700/50 text-slate-200"
        />
      </div>

      <div>
        <Label className="text-slate-300 mb-3 block">Tags</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-emerald-500/10 text-emerald-400">
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag"
            className="bg-slate-900/50 border-slate-700/50 text-slate-200"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addTag(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <Button variant="outline" size="sm" className="border-slate-700/50 text-slate-300">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RiverStep;
