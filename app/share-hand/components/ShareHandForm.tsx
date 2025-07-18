'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useShareHandContext } from './ShareHandProvider';
import ShareHandProgress from './ShareHandProgress';
import ShareHandNavigation from './ShareHandNavigation';
import GameSetupStep from './GameSetupStep';
import PositionsStep from './PositionsStep';
import PreflopStep from './PreflopStep';
import FlopStep from './FlopStep';
import TurnStep from './TurnStep';
import RiverStep from './RiverStep';
import { useState, useEffect } from 'react';
import { ActionType } from '@/types/poker';

const ShareHandForm = () => {
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const contextData = useShareHandContext();

  const {
    currentStep,
    formData,
    setFormData,
    tags,
    addTag,
    removeTag,
    getCurrencySymbol,
    getAvailableActions,
    updateAction,
    handleBetSizeSelect,
    getAllSelectedCards,
    currentPlayer,
    legalActions,
    processAction,
    pot,
    currentStreet,
    players,
    isGameInitialized,
    engineState,
  } = contextData;

  // Reset validation errors when step changes
  useEffect(() => {
    setShowValidationErrors(false);
  }, [currentStep]);

  const renderStepContent = () => {
    const commonProps = {
      formData,
      setFormData,
      getCurrencySymbol,
      getAvailableActions: (_street: string, index: number, allActions: any[]) => {
        // For positions step or when game not initialized, use the original logic
        if (currentStep === 1 || !isGameInitialized) {
          return getAvailableActions();
        }

        // For action steps with initialized game, use new engine
        const actionStep = allActions[index];
        if (actionStep && actionStep.playerId && currentPlayer?.id === actionStep.playerId) {
          return legalActions.map((action) => action.type);
        }

        // Fall back to original logic
        return getAvailableActions();
      },
      updateAction: (street: any, index: number, action: string, betAmount?: string) => {
        // For action steps with initialized game
        if (currentStep > 1 && isGameInitialized) {
          const allActions = (formData as any)[street] || [];
          const actionStep = allActions[index];

          if (actionStep && actionStep.playerId && currentPlayer?.id === actionStep.playerId) {
            const amount = betAmount ? parseFloat(betAmount) : undefined;
            processAction(actionStep.playerId, action as ActionType, amount);
          }
        }
        // Always update form data for UI consistency
        updateAction(street, index, action as any, betAmount);
      },
      handleBetSizeSelect: (street: any, index: number, amount: string) => {
        // For action steps with initialized game
        if (currentStep > 1 && isGameInitialized) {
          const allActions = (formData as any)[street] || [];
          const actionStep = allActions[index];

          if (actionStep && actionStep.playerId && currentPlayer?.id === actionStep.playerId) {
            const numericAmount = parseFloat(amount);

            // Determine correct action type based on betting situation
            let actionType: ActionType;
            const currentBet = engineState?.currentState?.betting?.currentBet || 0;

            if (currentBet === 0) {
              // No current bet - this is a BET
              actionType = ActionType.BET;
            } else if (numericAmount === currentBet) {
              // Matching current bet - this is a CALL
              actionType = ActionType.CALL;
            } else if (numericAmount > currentBet) {
              // Raising the bet - this is a RAISE
              actionType = ActionType.RAISE;
            } else {
              // Fallback to CALL for partial amounts
              actionType = ActionType.CALL;
            }

            processAction(actionStep.playerId, actionType, numericAmount);
          }
        }
        // Always update form data for UI consistency
        handleBetSizeSelect(street, index, amount);
      },
      getAllSelectedCards,
      gameState: {
        pot,
        currentStreet,
        players,
      },
    };

    switch (currentStep) {
      case 0:
        return <GameSetupStep {...commonProps} showValidationErrors={showValidationErrors} />;
      case 1:
        return <PositionsStep {...commonProps} showValidationErrors={showValidationErrors} />;
      case 2:
        return <PreflopStep {...commonProps} pot={pot} />;
      case 3:
        return <FlopStep {...commonProps} pot={pot} />;
      case 4:
        return <TurnStep {...commonProps} pot={pot} />;
      case 5:
        return (
          <RiverStep {...commonProps} pot={pot} tags={tags} addTag={addTag} removeTag={removeTag} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <Card className="bg-slate-800/40 border-slate-700/30 w-full">
        <CardHeader className="pb-2">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-200">Hand Details</h2>
            <ShareHandProgress />
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-3 overflow-x-hidden">
          <div className="w-full overflow-x-hidden">{renderStepContent()}</div>
          <ShareHandNavigation onValidationError={() => setShowValidationErrors(true)} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareHandForm;
