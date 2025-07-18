'use client';

import React from 'react';
import { ActionStepCard } from './action-flow';
import { useShareHandContext } from './ShareHandProvider';
import { ActionType } from '@/types/poker';

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
}: ActionFlowProps) => {
  const actions = formData[street];
  const potSize = calculatePotSize();
  const currentStackSize = formData.heroStackSize[0];

  const {
    currentPlayer,
    legalActions,
    processAction: processEngineAction,
    isGameInitialized,
  } = useShareHandContext();

  const handleActionClick = (actionStep: any, index: number, action: string) => {
    // If game is initialized and this is the current player, use the new engine
    if (isGameInitialized && currentPlayer && actionStep.playerId === currentPlayer.id) {
      const actionType = action as ActionType;

      // Check if action is legal
      const isLegal = legalActions.some((a) => a.type === actionType);
      if (!isLegal) {
        return;
      }

      // For betting actions, we need to get the amount
      let amount: number | undefined;
      if (['bet', 'raise'].includes(action)) {
        const legalAction = legalActions.find((a) => a.type === actionType);
        if (legalAction && 'minAmount' in legalAction) {
          amount = legalAction.minAmount;
        }
      }

      // Process through new engine
      processEngineAction(actionStep.playerId, actionType, amount);
    } else {
      // Use legacy action processing
      updateAction(street, index, action);
    }
  };

  return (
    <div className="space-y-4">
      {actions.map((action: any, index: number) => (
        <ActionStepCard
          key={index}
          actionStep={action}
          index={index}
          street={street}
          availableActions={getAvailableActions(street, index, actions)}
          formData={formData}
          potSize={potSize}
          currentStackSize={currentStackSize}
          getPositionName={getPositionName}
          getCurrencySymbol={getCurrencySymbol}
          getActionButtonClass={getActionButtonClass}
          handleActionClick={handleActionClick}
          handleBetInputChange={(_actionStep, index, value) => {
            // Handle bet input change
            updateAction(street, index, 'bet', value);
          }}
          handleBetSizeSelect={handleBetSizeSelect}
        />
      ))}
    </div>
  );
};

export default ActionFlow;
