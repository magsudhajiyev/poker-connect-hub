
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// Helper function to filter out invalid actions
const filterValidActions = (actions: string[], position: string, street: string): string[] => {
  // For preflop, non-BB players cannot check
  if (street === 'preflopActions' && position !== 'bb') {
    return actions.filter(action => action !== 'check');
  }
  return actions;
};

interface ActionSelectionButtonsProps {
  availableActions: string[];
  selectedAction: string;
  onActionSelect: (action: string) => void;
  position?: string;
  street?: string;
}

const ActionSelectionButtons = ({
  availableActions,
  selectedAction,
  onActionSelect,
  position = '',
  street = ''
}: ActionSelectionButtonsProps) => {
  // Filter actions to ensure correctness
  const validActions = filterValidActions(availableActions, position, street);
  const getActionButtonClass = (action: string, isSelected: boolean) => {
    const baseClass = "transition-colors border";
    if (isSelected) {
      return `${baseClass} bg-emerald-500 text-slate-900 border-emerald-500`;
    }
    
    switch (action) {
      case 'fold':
        return `${baseClass} border-red-500/50 text-red-300 hover:bg-red-500/20 bg-slate-800`;
      case 'call':
        return `${baseClass} border-blue-500/50 text-blue-300 hover:bg-blue-500/20 bg-slate-800`;
      case 'check':
        return `${baseClass} border-green-500/50 text-green-300 hover:bg-green-500/20 bg-slate-800`;
      case 'bet':
      case 'raise':
        return `${baseClass} border-orange-500/50 text-orange-300 hover:bg-orange-500/20 bg-slate-800`;
      default:
        return `${baseClass} border-slate-700/50 text-slate-300 hover:bg-slate-800/50 bg-slate-800`;
    }
  };

  const handleActionSelect = (action: string) => {
    console.log('Action selected:', action, Date.now());
    // Immediate execution to prevent timing issues
    onActionSelect(action);
  };

  return (
    <div>
      <Label className="text-slate-300 text-sm font-medium mb-3 block">Choose Action</Label>
      <div className="grid grid-cols-2 gap-2">
        {validActions.map((action) => (
          <Button
            key={action}
            size="sm"
            onClick={() => handleActionSelect(action)}
            className={getActionButtonClass(action, selectedAction === action)}
          >
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ActionSelectionButtons;
