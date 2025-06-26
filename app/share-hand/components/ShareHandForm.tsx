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
    getPositionName,
    getCurrencySymbol,
    calculatePotSize,
    getAvailableActions,
    updateAction,
    getActionButtonClass,
    handleBetSizeSelect,
    getAllSelectedCards,
    gameStateUI,
    pokerActions,
  } = contextData;

  // Reset validation errors when step changes
  useEffect(() => {
    setShowValidationErrors(false);
  }, [currentStep]);

  const renderStepContent = () => {
    const showPot = currentStep > 1;

    const commonProps = {
      formData: {
        ...formData,
        pokerActions, // Pass poker actions through form data
      },
      setFormData,
      getPositionName,
      getCurrencySymbol,
      calculatePotSize: () => pokerActions.pot || calculatePotSize(),
      getAvailableActions: (street: string, index: number, allActions: any[]) => {
        // For positions step, use the original logic
        if (currentStep === 1) {
          return getAvailableActions(street, index, allActions);
        }

        // For action steps, try to get actions from poker algorithm first
        console.log('Getting available actions for street:', street, 'index:', index);

        // Find the player that should be acting at this index
        const actionStep = allActions[index];
        if (actionStep && actionStep.playerId) {
          if (pokerActions.isPlayerToAct(actionStep.playerId)) {
            const validActions = pokerActions.getValidActionsForPlayer(actionStep.playerId);
            const actionTypes = validActions.map((action: any) => action.type || action);
            console.log('Poker algorithm actions for player:', actionStep.playerId, actionTypes);
            return actionTypes;
          }
        }

        // Fall back to original logic
        return getAvailableActions(street, index, allActions);
      },
      updateAction: (street: any, index: number, action: string, betAmount?: string) => {
        // Execute action using poker algorithm if we're in action steps
        if (currentStep > 1 && pokerActions.algorithm) {
          const amount = betAmount ? parseFloat(betAmount) : 0;
          const success = pokerActions.executeAction(action, amount);

          if (success) {
            console.log(`Action ${action} executed successfully`);
            // Update the form data as well for consistency
            updateAction(street, index, action, betAmount);
          }
        } else {
          // Fall back to original logic for positions step
          updateAction(street, index, action, betAmount);
        }
      },
      getActionButtonClass,
      handleBetSizeSelect: (street: any, index: number, amount: string) => {
        // Use poker algorithm for action steps
        if (currentStep > 1 && pokerActions.algorithm) {
          const numericAmount = parseFloat(amount);
          const success = pokerActions.executeAction('bet', numericAmount);

          if (success) {
            console.log(`Bet size ${amount} executed successfully`);
            // Update the form data as well for consistency
            handleBetSizeSelect(street, index, amount);
          }
        } else {
          // Fall back to original logic
          handleBetSizeSelect(street, index, amount);
        }
      },
      getAllSelectedCards,
      gameState: gameStateUI.gameState,
      pokerActions,
    };

    switch (currentStep) {
      case 0:
        return <GameSetupStep {...commonProps} showValidationErrors={showValidationErrors} />;
      case 1:
        return <PositionsStep {...commonProps} showValidationErrors={showValidationErrors} />;
      case 2:
        return <PreflopStep {...commonProps} showPot={showPot} />;
      case 3:
        return <FlopStep {...commonProps} showPot={showPot} />;
      case 4:
        return <TurnStep {...commonProps} showPot={showPot} />;
      case 5:
        return (
          <RiverStep
            {...commonProps}
            showPot={showPot}
            tags={tags}
            addTag={addTag}
            removeTag={removeTag}
          />
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
