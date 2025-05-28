
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

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-slate-300">Action Flow</h4>
      {actions.map((actionStep: any, index: number) => {
        const availableActions = getAvailableActions(street, index);
        
        return (
          <div key={`${actionStep.playerId}-${index}`} className="border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className={`font-medium ${actionStep.isHero ? 'text-emerald-400' : 'text-violet-400'}`}>
                {actionStep.playerName} ({getPositionName(actionStep.isHero ? formData.heroPosition : formData.villainPosition)})
              </span>
              {actionStep.completed && (
                <Check className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-slate-300">Action</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {availableActions.map((action) => (
                    <Button
                      key={action}
                      size="sm"
                      onClick={() => updateAction(street, index, action)}
                      className={getActionButtonClass(action, actionStep.action === action)}
                    >
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              
              {(actionStep.action === 'bet' || actionStep.action === 'raise') && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-slate-300">Quick Bet Sizes</Label>
                    <BetSizingButtons
                      potSize={potSize}
                      stackSize={currentStackSize}
                      onBetSizeSelect={(amount) => handleBetSizeSelect(street, index, amount)}
                      gameFormat={formData.gameFormat}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">{getBetSizeLabel()}</Label>
                    <Input
                      value={actionStep.betAmount || ''}
                      onChange={(e) => updateAction(street, index, actionStep.action!, e.target.value)}
                      placeholder="2.5"
                      className="bg-slate-900/50 border-slate-700/50 text-slate-200"
                    />
                  </div>
                </div>
              )}

              {actionStep.action === 'call' && actionStep.betAmount && (
                <div>
                  <Label className="text-slate-300">Call Amount</Label>
                  <div className="text-emerald-400 font-medium">
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
