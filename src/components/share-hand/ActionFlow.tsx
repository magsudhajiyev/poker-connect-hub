
import React from 'react';
import { ActionStepCard } from './action-flow';
import { useGameStateUI } from '@/hooks/useGameStateUI';
import { GameState } from '@/utils/gameState';
import { processAction, removeFoldedPlayerFromFutureStreets } from '@/utils/shareHandActions';
import { useShareHandContext } from './ShareHandProvider';

interface ActionFlowProps {
  street: 'preflopActions' | 'flopActions' | 'turnActions' | 'riverActions';
  formData: any;
  getPositionName: (position: string) => string;
  getCurrencySymbol: () => string;
  calculatePotSize: () => number;
  getAvailableActions: (street: string, index: number, allActions: any[]) => string[];
  updateAction: (street: any, index: number, action: string, betAmount?: string) => void;
  getActionButtonClass: (action: string, isSelected: boolean) => string;
  handleBetSizeSelect: (street: any, index: number, amount: string) => void;
  gameState?: GameState | null;
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
  handleBetSizeSelect,
  gameState 
}: ActionFlowProps) => {
  const actions = formData[street];
  const potSize = calculatePotSize();
  const currentStackSize = formData.heroStackSize[0];
  
  const { isPlayerActive } = useGameStateUI(gameState);
  const { gameStateUI, setFormData } = useShareHandContext();

  const handleActionClick = (actionStep: any, index: number, action: string) => {
    // Validate action step and position
    if (!actionStep || !actionStep.position) {
      console.warn('Invalid action step or missing position:', actionStep);
      updateAction(street, index, action);
      return;
    }

    console.log(`Processing action click: ${action} by ${actionStep.playerName} at position ${actionStep.position}`);

    // If player folded, remove them from future streets immediately
    if (action === 'fold') {
      console.log(`Player ${actionStep.playerId} folded, removing from future streets`);
      const updatedFormData = removeFoldedPlayerFromFutureStreets(formData, actionStep.playerId);
      setFormData(updatedFormData);
    }
    
    // Process action through the standard update mechanism
    // The auto-advancement will be handled by the updated updateAction function
    updateAction(street, index, action);
  };

  const handleBetInputChange = (actionStep: any, index: number, value: string) => {
    // Validate input is numeric
    const numericValue = parseFloat(value);
    if (value !== '' && (isNaN(numericValue) || numericValue < 0)) {
      console.warn('Invalid bet input:', value);
      return;
    }
    
    updateAction(street, index, actionStep.action!, value);
  };

  return (
    <div className="space-y-2 w-full overflow-x-hidden">
      <h4 className="text-sm font-medium text-slate-300">Action Flow</h4>
      {actions.map((actionStep: any, index: number) => {
        const availableActions = getAvailableActions(street, index, actions);
        
        return (
          <ActionStepCard
            key={`${actionStep.playerId}-${index}`}
            actionStep={actionStep}
            index={index}
            street={street}
            availableActions={availableActions}
            formData={formData}
            potSize={potSize}
            currentStackSize={currentStackSize}
            gameState={gameState}
            getPositionName={getPositionName}
            getCurrencySymbol={getCurrencySymbol}
            getActionButtonClass={getActionButtonClass}
            handleActionClick={handleActionClick}
            handleBetInputChange={handleBetInputChange}
            handleBetSizeSelect={handleBetSizeSelect}
          />
        );
      })}
    </div>
  );
};

export default ActionFlow;
