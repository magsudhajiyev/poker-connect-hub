'use client';


import React from 'react';
import { Button } from '@/components/ui/button';

interface TableActionButtonsProps {
  availableActions: string[];
  onActionSelect: (action: string) => void;
  selectedAction?: string;
  disabled?: boolean;
}

const TableActionButtons = ({ 
  availableActions, 
  onActionSelect, 
  selectedAction,
  disabled = false, 
}: TableActionButtonsProps) => {
  const getActionColor = (action: string) => {
    switch (action) {
      case 'fold':
        return 'bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30';
      case 'call':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30';
      case 'check':
        return 'bg-green-500/20 border-green-500/50 text-green-300 hover:bg-green-500/30';
      case 'bet':
      case 'raise':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-300 hover:bg-orange-500/30';
      default:
        return 'bg-slate-500/20 border-slate-500/50 text-slate-300 hover:bg-slate-500/30';
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {availableActions.map((action) => (
        <Button
          key={action}
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => onActionSelect(action)}
          className={`${getActionColor(action)} ${
            selectedAction === action ? 'ring-2 ring-white/50' : ''
          }`}
        >
          {action.charAt(0).toUpperCase() + action.slice(1)}
        </Button>
      ))}
    </div>
  );
};

export default TableActionButtons;
