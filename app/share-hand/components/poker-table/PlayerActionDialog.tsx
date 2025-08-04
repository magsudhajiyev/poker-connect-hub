'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Player } from '@/types/shareHand';
import { usePlayerActionDialog } from './hooks/usePlayerActionDialog';
import ActionSelectionButtons from './components/ActionSelectionButtons';
import BettingInterface from './components/BettingInterface';
import { ActionType, requiresBetAmount } from '@/constants';
import { usePokerHandStore } from '@/stores/poker-hand-store';
import { Skeleton } from '@/components/ui/skeleton';

interface PlayerActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player;
  position: string;
  currentStreet: string;
  formData: any;
  pokerActions?: any;
  getAvailableActions?: (street: string, index: number, allActions: any[]) => string[];
  updateAction?: (street: any, index: number, action: ActionType, betAmount?: string) => void;
  handleBetSizeSelect?: (street: any, index: number, amount: string) => void;
}

const PlayerActionDialog = ({
  isOpen,
  onOpenChange,
  player,
  position,
  currentStreet,
  formData,
  pokerActions,
  getAvailableActions,
  updateAction,
  handleBetSizeSelect,
}: PlayerActionDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validActions, setValidActions] = useState<ActionType[]>([]);
  const [isLoadingActions, setIsLoadingActions] = useState(false);
  
  const store = usePokerHandStore();

  // Fetch valid actions when dialog opens or state changes
  useEffect(() => {
    async function fetchValidActions() {
      if (!isOpen) {
        return;
      }
      
      setIsLoadingActions(true);
      try {
        if (store.eventAdapter) {
          // Use store method that queries event sourcing
          const actions = await store.getValidActionsForCurrentPlayer();
          setValidActions(actions);
        } else {
          // Use engine's legal actions for legacy mode
          const legalActions = store.getLegalActions();
          setValidActions(legalActions.map(action => action.type));
        }
      } catch (error) {
        console.error('Failed to fetch valid actions:', error);
        setValidActions([]);
      } finally {
        setIsLoadingActions(false);
      }
    }

    fetchValidActions();
  }, [isOpen, store.engineState, store.eventAdapter, store]); // Re-fetch when engine state changes

  // Reset submitting state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const {
    selectedAction,
    setSelectedAction,
    betAmount,
    setBetAmount,
    actionIndex,
    availableActions,
    potSize,
    stackSize,
  } = usePlayerActionDialog({
    isOpen,
    player,
    currentStreet,
    formData,
    pokerActions,
    getAvailableActions,
  });

  const handleActionSelect = (action: string) => {
    // Prevent action if already submitting
    if (isSubmitting) {
      return;
    }

    setSelectedAction(action);

    // For actions that don't require bet amount, submit immediately
    // bet and raise require amount input, so don't submit immediately
    if (!requiresBetAmount(action as ActionType)) {
      submitAction(action as ActionType);
    }
  };

  const handleBetSizeButtonSelect = (amount: string) => {
    setBetAmount(amount);

    // Use a valid index - if actionIndex is -1, use 0 as fallback
    const validIndex = actionIndex >= 0 ? actionIndex : 0;

    // If we have pokerActions (action flow system), always use submitAction
    // to ensure both form data AND action flow are updated
    if (pokerActions && pokerActions.executeAction) {
      submitAction(selectedAction as ActionType, amount);
    } else if (handleBetSizeSelect) {
      handleBetSizeSelect(currentStreet, validIndex, amount);
      onOpenChange(false);
    } else {
      // If no handleBetSizeSelect function, just submit the bet action
      submitAction(selectedAction as ActionType, amount);
    }
  };

  const submitAction = async (action: ActionType, amount?: string) => {
    // Prevent double-click submissions
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    // Get current action slot for processing
    const currentSlot = store.getCurrentActionSlot();

    // Try to use store's processAction method first (works with both event sourcing and legacy)
    if (currentSlot && currentSlot.playerId === player.id) {
      try {
        const numericAmount = amount ? parseFloat(amount) : undefined;
        const success = await store.processAction(currentSlot.id, action, numericAmount);
        
        if (success) {
          // Add minimal delay to ensure state update is processed before closing dialog
          setTimeout(() => {
            onOpenChange(false);
            setIsSubmitting(false);
          }, 50);
        } else {
          console.error('Action processing failed');
          setIsSubmitting(false);
          return;
        }
      } catch (error) {
        console.error('Error processing action:', error);
        setIsSubmitting(false);
        return;
      }
    } else if (pokerActions && pokerActions.executeAction) {
      // Fallback to legacy action flow
      const numericAmount = amount ? parseFloat(amount) : 0;
      const success = pokerActions.executeAction(player.id, action, numericAmount);

      if (success) {
        // Add minimal delay to ensure state update is processed before closing dialog
        setTimeout(() => {
          onOpenChange(false);
          setIsSubmitting(false);
        }, 50); // Reduced from 100ms to 50ms for better responsiveness
      } else {
        setIsSubmitting(false);
        return; // Don't proceed if action flow fails
      }
    } else {
      // If no action flow, close immediately
      console.warn('[PlayerActionDialog] No action processing method available');
      setIsSubmitting(false);
      onOpenChange(false);
    }

    // ALSO try to update form data for UI consistency (but don't fail if this fails)
    if (updateAction) {
      try {
        const validIndex = actionIndex >= 0 ? actionIndex : 0;
        updateAction(currentStreet, validIndex, action, amount || betAmount);
      } catch {
        // Silently handle error
      }
    }
  };

  const handleBetSubmit = () => {
    if (isSubmitting) {
      return;
    }

    if (selectedAction && requiresBetAmount(selectedAction as ActionType)) {
      if (!betAmount || parseFloat(betAmount) <= 0) {
        alert('Please enter a valid bet amount');
        return;
      }
      submitAction(selectedAction as ActionType, betAmount);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-200 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-200">
            {player.name} Action ({position.toUpperCase()})
          </DialogTitle>
          <DialogDescription className="text-slate-400 space-y-1">
            <span className="block">Stack: ${stackSize}</span>
            <span className="block">Pot: ${potSize}</span>
            {store.eventAdapter && store.engineState && store.engineState.currentState && store.engineState.currentState.players ? (
              <span className="block mt-2">
                Current Bet: ${store.engineState.currentState.betting?.currentBet || 0} |
                To Call: ${(() => {
                  const currentBet = store.engineState.currentState.betting?.currentBet || 0;
                  const players = store.engineState.currentState.players;
                  
                  // Handle both Map and plain object cases
                  let playerCurrentBet = 0;
                  if (players instanceof Map) {
                    playerCurrentBet = players.get(player.id)?.currentBet || 0;
                  } else if (typeof players === 'object' && players[player.id]) {
                    playerCurrentBet = (players as any)[player.id].currentBet || 0;
                  }
                  
                  return currentBet - playerCurrentBet;
                })()}
              </span>
            ) : (
              <span className="block mt-2">Choose an action for this player</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoadingActions ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              {/* Available Actions */}
              <ActionSelectionButtons
                availableActions={validActions.length > 0 ? validActions : availableActions}
                selectedAction={selectedAction}
                onActionSelect={handleActionSelect}
                position={player.position}
                street={currentStreet}
              />

              {/* Betting Interface */}
              <BettingInterface
                selectedAction={selectedAction}
                betAmount={betAmount}
                setBetAmount={setBetAmount}
                potSize={potSize}
                stackSize={stackSize}
                gameFormat={formData?.gameFormat}
                onBetSizeButtonSelect={handleBetSizeButtonSelect}
                onBetSubmit={handleBetSubmit}
              />
            </>
          )}

          {validActions.length === 0 && !isLoadingActions && store.eventAdapter && (
            <p className="text-center text-muted-foreground mt-4">
              No valid actions available
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerActionDialog;
