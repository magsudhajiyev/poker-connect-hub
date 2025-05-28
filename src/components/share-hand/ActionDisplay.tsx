
import React from 'react';
import { ActionStep, ShareHandFormData } from '@/types/shareHand';
import { Check } from 'lucide-react';

interface ActionDisplayProps {
  actions: ActionStep[];
  formData: ShareHandFormData;
  getPositionName: (position: string) => string;
  getCurrencySymbol: () => string;
}

const ActionDisplay = ({ actions, formData, getPositionName, getCurrencySymbol }: ActionDisplayProps) => {
  return (
    <div className="space-y-3">
      <h5 className="text-slate-300 font-medium">Action Sequence</h5>
      {actions.map((actionStep, index) => (
        <div key={`${actionStep.playerId}-${index}`} className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/30">
          <div className="flex items-center justify-between mb-2">
            <span className={`font-medium ${actionStep.isHero ? 'text-emerald-400' : 'text-violet-400'}`}>
              {actionStep.playerName} ({getPositionName(actionStep.isHero ? formData.heroPosition : formData.villainPosition)})
            </span>
            {actionStep.completed && (
              <Check className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          
          {actionStep.action && (
            <div className="flex items-center space-x-2">
              <span className="text-slate-200 font-medium capitalize">
                {actionStep.action}
              </span>
              {actionStep.betAmount && (actionStep.action === 'bet' || actionStep.action === 'raise' || actionStep.action === 'call') && (
                <span className="text-emerald-400 font-medium">
                  {getCurrencySymbol()}{actionStep.betAmount}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ActionDisplay;
