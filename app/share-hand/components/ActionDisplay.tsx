'use client';


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
    <div className="space-y-2 sm:space-y-3">
      <h5 className="text-slate-300 font-medium text-sm sm:text-base">Action Sequence</h5>
      {actions.map((actionStep, index) => {
        // Get position from action step or find the player in formData.players
        let playerPosition = actionStep.position;
        if (!playerPosition && formData.players) {
          const player = formData.players.find((p: any) => p.id === actionStep.playerId);
          playerPosition = player?.position || '';
        }
        
        return (
          <div key={`${actionStep.playerId}-${index}`} className="bg-slate-900/60 rounded-lg p-2 sm:p-3 border border-slate-700/30">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className={`font-medium text-sm sm:text-base ${actionStep.isHero ? 'text-emerald-400' : 'text-violet-400'}`}>
                {actionStep.playerName} ({getPositionName(playerPosition)})
              </span>
              {actionStep.completed && (
                <Check className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
              )}
            </div>
            
            {actionStep.action && (
              <div className="flex items-center space-x-2">
                <span className="text-slate-200 font-medium capitalize text-sm sm:text-base">
                  {actionStep.action}
                </span>
                {actionStep.betAmount && (actionStep.action === 'bet' || actionStep.action === 'raise' || actionStep.action === 'call') && (
                  <span className="text-emerald-400 font-medium text-sm sm:text-base">
                    {getCurrencySymbol()}{actionStep.betAmount}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ActionDisplay;
