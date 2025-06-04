
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import BetSizingButtons from '@/components/BetSizingButtons';

interface ActionFlowProps {
  street: 'preflopActions' | 'flopActions' | 'turnActions' | 'riverActions';
  formData: any;
  getPositionName: (position: string) => string;
  getCurrencySymbol: () => string;
  calculatePotSize: () => number;
  getAvailableActions: (street: string, index: number) => string[];
  updateAction: (street: any, index: number, action: string, betAmount?: string) => void;
  getActionButtonClass: (action: string, isSelected: boolean) => string;
  handleBetSizeSelect: (street: any, index: number, amount: string) => void;
}

const ActionFlow = ({ 
  street, 
  formData, 
  getPositionName, 
  getCurrencySymbol, 
  calculatePotSize, 
  getAvailableActions, 
  updateAction, 
  getActionButtonClass, 
  handleBetSizeSelect 
}: ActionFlowProps) => {
  const actions = formData[street];
  const potSize = calculatePotSize();
  const currentStackSize = formData.heroStackSize[0];

  const getBetSizeLabel = () => {
    return formData.gameFormat === 'cash' ? 'Bet Size ($)' : 'Bet Size (BB)';
  };

  // Helper function to get player position
  const getPlayerPosition = (actionStep: any) => {
    if (formData.players && formData.players.length > 0) {
      const player = formData.players.find((p: any) => p.id === actionStep.playerId);
      return player?.position || '';
    }
    
    // Legacy fallback
    return actionStep.isHero ? formData.heroPosition : formData.villainPosition;
  };

  return (
    <div className="space-y-2 w-full overflow-x-hidden">
      <h4 className="text-sm font-medium text-slate-300">Action Flow</h4>
      {actions.map((actionStep: any, index: number) => {
        const availableActions = getAvailableActions(street, index);
        const playerPosition = getPlayerPosition(actionStep);
        
        return (
          <div key={`${actionStep.playerId}-${index}`} className="border border-slate-700/50 rounded-lg p-2 w-full overflow-x-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium text-xs truncate ${actionStep.isHero ? 'text-emerald-400' : 'text-violet-400'}`}>
                {actionStep.playerName} ({getPositionName(playerPosition)})
              </span>
              {actionStep.completed && (
                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              )}
            </div>
            
            <div className="space-y-2 w-full">
              <div className="w-full">
                <Label className="text-slate-300 text-xs">Action</Label>
                <div className="grid grid-cols-2 gap-1 mt-1 w-full">
                  {availableActions.map((action) => (
                    <Button
                      key={action}
                      size="sm"
                      onClick={() => updateAction(street, index, action)}
                      className={`${getActionButtonClass(action, actionStep.action === action)} text-xs h-7 truncate`}
                    >
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              
              {(actionStep.action === 'bet' || actionStep.action === 'raise') && (
                <div className="space-y-2 w-full">
                  <div className="w-full overflow-x-hidden">
                    <Label className="text-slate-300 text-xs">Quick Bet Sizes</Label>
                    <div className="mt-1">
                      <BetSizingButtons
                        potSize={potSize}
                        stackSize={currentStackSize}
                        onBetSizeSelect={(amount) => handleBetSizeSelect(street, index, amount)}
                        gameFormat={formData.gameFormat}
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <Label className="text-slate-300 text-xs">{getBetSizeLabel()}</Label>
                    <Input
                      value={actionStep.betAmount || ''}
                      onChange={(e) => updateAction(street, index, actionStep.action!, e.target.value)}
                      placeholder="2.5"
                      className="bg-slate-900/50 border-slate-700/50 text-slate-200 text-xs h-8 mt-1 w-full"
                    />
                  </div>
                </div>
              )}

              {actionStep.action === 'call' && actionStep.betAmount && (
                <div className="w-full">
                  <Label className="text-slate-300 text-xs">Call Amount</Label>
                  <div className="text-emerald-400 font-medium text-xs">
                    {getCurrencySymbol()}{actionStep.betAmount}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActionFlow;
