'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
// Removed old imports - using new state machine architecture

interface ActionButtonsProps {
  actionStep: any;
  index: number;
  availableActions: string[];
  isCurrentPlayer: boolean;
  getActionButtonClass: (action: string, isSelected: boolean) => string;
  handleActionClick: (actionStep: any, index: number, action: string) => void;
}

export const ActionButtons = ({
  actionStep,
  index,
  availableActions,
  isCurrentPlayer,
  getActionButtonClass,
  handleActionClick,
}: ActionButtonsProps) => {
  // Removed old game state logic - using new state machine architecture
  // All actions passed to this component are already validated

  return (
    <div className="w-full">
      <Label className="text-slate-300 text-xs">Action</Label>
      <div className="grid grid-cols-2 gap-1 mt-1 w-full">
        {availableActions.map((action) => {
          const isAvailable = true; // Actions are pre-validated
          return (
            <Button
              key={action}
              size="sm"
              onClick={() => handleActionClick(actionStep, index, action)}
              disabled={!isAvailable && isCurrentPlayer}
              className={`${getActionButtonClass(action, actionStep.action === action)} text-xs h-7 truncate transition-opacity action-button ${action} ${
                !isAvailable && isCurrentPlayer ? 'opacity-50' : ''
              }`}
              style={{
                display: isCurrentPlayer && !isAvailable ? 'none' : 'block',
              }}
            >
              {action.charAt(0).toUpperCase() + action.slice(1)}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
