
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
    <div className="space-y-3 sm:space-y-4 w-full overflow-x-hidden">
      <h4 className="text-sm sm:text-md font-medium text-slate-300">Action Flow</h4>
      {actions.map((actionStep: any, index: number) => {
        const availableActions = getAvailableActions(street, index);
        
        return (
          <div key={`${actionStep.playerId}-${index}`} className="border border-slate-700/50 rounded-lg p-2 sm:p-3 md:p-4 w-full overflow-x-hidden">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className={`font-medium text-xs sm:text-sm md:text-base truncate ${actionStep.isHero ? 'text-emerald-400' : 'text-violet-400'}`}>
                {actionStep.playerName} ({getPositionName(actionStep.isHero ? formData.heroPosition : formData.villainPosition)})
              </span>
              {actionStep.completed && (
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
              )}
            </div>
            
            <div className="space-y-2 sm:space-y-3 w-full">
              <div className="w-full">
                <Label className="text-slate-300 text-xs sm:text-sm">Action</Label>
                <div className="grid grid-cols-2 gap-1 sm:gap-2 mt-1 sm:mt-2 w-full">
                  {availableActions.map((action) => (
                    <Button
                      key={action}
                      size="sm"
                      onClick={() => updateAction(street, index, action)}
                      className={`${getActionButtonClass(action, actionStep.action === action)} text-xs sm:text-sm truncate`}
                    >
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              
              {(actionStep.action === 'bet' || actionStep.action === 'raise') && (
                <div className="space-y-2 sm:space-y-3 w-full">
                  <div className="w-full overflow-x-hidden">
                    <Label className="text-slate-300 text-xs sm:text-sm">Quick Bet Sizes</Label>
                    <div className="mt-1 sm:mt-2">
                      <BetSizingButtons
                        potSize={potSize}
                        stackSize={currentStackSize}
                        onBetSizeSelect={(amount) => handleBetSizeSelect(street, index, amount)}
                        gameFormat={formData.gameFormat}
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <Label className="text-slate-300 text-xs sm:text-sm">{getBetSizeLabel()}</Label>
                    <Input
                      value={actionStep.betAmount || ''}
                      onChange={(e) => updateAction(street, index, actionStep.action!, e.target.value)}
                      placeholder="2.5"
                      className="bg-slate-900/50 border-slate-700/50 text-slate-200 text-xs sm:text-sm mt-1 sm:mt-2 w-full"
                    />
                  </div>
                </div>
              )}

              {actionStep.action === 'call' && actionStep.betAmount && (
                <div className="w-full">
                  <Label className="text-slate-300 text-xs sm:text-sm">Call Amount</Label>
                  <div className="text-emerald-400 font-medium text-xs sm:text-sm">
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
