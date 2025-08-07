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
import { Street, Position } from '@/types/poker';
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
        // Small delay to ensure state is synchronized
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Debug logging for action fetching (disabled for production)

        // IMPORTANT: We fetch actions regardless of who's turn it is
        // The API will return the correct actions for the current player
        // This helps avoid race conditions where engine state hasn't updated yet
        // We'll validate authorization when actually submitting an action

        if (store.eventAdapter) {
          // Use store method that queries event sourcing
          const actions = await store.getValidActionsForCurrentPlayer();
          // Debug logging (disabled for production)

          // Only set valid actions if we got a response
          // Empty array means no actions available for this player
          if (Array.isArray(actions)) {
            setValidActions(actions);
          }
        } else {
          // Use engine's legal actions for legacy mode
          const legalActions = store.getLegalActions();
          setValidActions(legalActions.map((action) => action.type));
        }
      } catch (_error) {
        // console.error('Failed to fetch valid actions:', error);
        setValidActions([]);
      } finally {
        setIsLoadingActions(false);
      }
    }

    fetchValidActions();
  }, [isOpen, store.engineState, store.eventAdapter, store, player.id]); // Re-fetch when engine state changes

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

    // CRITICAL AUTHORIZATION CHECK: Verify player is allowed to act
    const engineActionOn = store.engineState?.currentState?.betting?.actionOn;

    // Block action if engine state shows different player should act
    if (engineActionOn !== player.id) {
      // console.error('[PlayerActionDialog] Player not authorized - different player should act', {
      //   attemptingPlayer: player.id,
      //   shouldActPlayer: engineActionOn
      // });
      setIsSubmitting(false);
      alert(`It's not your turn. Waiting for ${engineActionOn} to act.`);
      return;
    }

    // Convert bet to raise if there's already a bet (poker terminology fix)
    let actualAction = action;
    const currentBet = store.engineState?.currentState?.betting?.currentBet || 0;
    if (action === ActionType.BET && currentBet > 0) {
      actualAction = ActionType.RAISE;
      // console.log('[PlayerActionDialog] Converting BET to RAISE since currentBet > 0');
    }

    // Get current action slot for processing
    let currentSlot = store.getCurrentActionSlot();

    // console.log('[PlayerActionDialog] submitAction debug:', {
    //   action,
    //   amount,
    //   playerId: player.id,
    //   currentSlot: currentSlot ? {
    //     id: currentSlot.id,
    //     playerId: currentSlot.playerId,
    //     isActive: currentSlot.isActive
    //   } : null,
    //   storeCurrentStreet: store.currentStreet,
    //   engineCurrentStreet: store.engineState?.currentState?.street,
    //   engineActionOn: store.engineState?.currentState?.betting?.actionOn
    // });

    // If no current slot, try to generate action slots for the current street
    if (!currentSlot) {
      // console.log('[PlayerActionDialog] No current slot found, attempting to generate action slots');

      // Use engine state street as source of truth
      const targetStreet =
        (store.engineState?.currentState?.street as Street) || store.currentStreet;

      if (store.generateActionSlots) {
        // console.log('[PlayerActionDialog] Generating action slots for street:', targetStreet);
        store.generateActionSlots(targetStreet);

        // Wait a moment for state update
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Try again after generating slots
        currentSlot = store.getCurrentActionSlot();
        // console.log('[PlayerActionDialog] After generating slots, currentSlot:', currentSlot ? {
        //   id: currentSlot.id,
        //   playerId: currentSlot.playerId,
        //   isActive: currentSlot.isActive
        // } : null);
      }
    }

    // If we still don't have a slot, or the slot is for a different player, try emergency fix
    if (!currentSlot || currentSlot.playerId !== player.id) {
      // console.log('[PlayerActionDialog] Emergency slot fix attempt', {
      //   hasSlot: !!currentSlot,
      //   slotPlayerId: currentSlot?.playerId,
      //   expectedPlayerId: player.id,
      //   engineActionOn: store.engineState?.currentState?.betting?.actionOn,
      //   engineStreet: store.engineState?.currentState?.street,
      // });

      // Check if the engine state shows this player should act
      const engineActionOn = store.engineState?.currentState?.betting?.actionOn;
      const engineStreet = store.engineState?.currentState?.street as Street;

      if (engineActionOn === player.id && engineStreet) {
        // console.log('[PlayerActionDialog] Engine confirms player should act, regenerating slots');
        // Force regenerate action slots for engine street
        if (store.generateActionSlots) {
          store.generateActionSlots(engineStreet);
          await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for regeneration
          currentSlot = store.getCurrentActionSlot();
          // console.log('[PlayerActionDialog] After emergency generation:', currentSlot ? 'slot found' : 'still no slot');

          // If still no slot after regeneration, create a temporary one
          if (!currentSlot) {
            // console.log('[PlayerActionDialog] Creating temporary slot for authorized player');
            currentSlot = {
              id: `temp-${engineStreet}-${player.id}`,
              playerId: player.id,
              playerName: player.name,
              position: player.position as Position,
              isHero: player.isHero || false,
              stackBefore: player.stackSize[0],
              stackAfter: player.stackSize[0],
              action: undefined,
              betAmount: '',
              isActive: true,
              completed: false,
              canEdit: false,
            };
          }
        }
      } else if (engineActionOn && engineActionOn !== player.id) {
        // console.log('[PlayerActionDialog] Different player should act:', {
        //   currentPlayer: player.id,
        //   shouldAct: engineActionOn,
        //   engineStreet,
        // });
        setIsSubmitting(false);
        return; // Exit early, don't show error
      } else {
        // console.error('[PlayerActionDialog] Player not authorized to act - this should not happen after auth checks', {
        //   player: player.id,
        //   engineActionOn,
        //   engineStreet,
        //   hasEngineState: !!store.engineState,
        //   engineStateStreet: store.engineState?.currentState?.street,
        //   storeCurrentStreet: store.currentStreet
        // });
        setIsSubmitting(false);
        // Don't proceed with action if player not authorized
        alert('Unable to process action. Please refresh and try again.');
        return;
      }
    }

    // Try to use store's processAction method first (works with both event sourcing and legacy)
    if (currentSlot && currentSlot.playerId === player.id) {
      // console.log('[PlayerActionDialog] Processing action with slot:', currentSlot.id);
      try {
        const numericAmount = amount ? parseFloat(amount) : undefined;
        const success = await store.processAction(currentSlot.id, actualAction, numericAmount);

        if (success) {
          // console.log('[PlayerActionDialog] Action processed successfully');
          // Add minimal delay to ensure state update is processed before closing dialog
          setTimeout(() => {
            onOpenChange(false);
            setIsSubmitting(false);
          }, 50);
        } else {
          // console.error('[PlayerActionDialog] Action processing failed');
          setIsSubmitting(false);
          return;
        }
      } catch (_error) {
        // console.error('Error processing action:', error);
        setIsSubmitting(false);
        return;
      }
    } else if (pokerActions && pokerActions.executeAction) {
      // Fallback to legacy action flow
      const numericAmount = amount ? parseFloat(amount) : 0;
      const success = pokerActions.executeAction(player.id, actualAction, numericAmount);

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
      // If no action flow available, try one more time to fix the state
      // console.error('[PlayerActionDialog] No action processing method available', {
      //   currentSlot,
      //   playerId: player.id,
      //   hasStore: !!store,
      //   hasPokerActions: !!pokerActions,
      //   currentStreet: store.currentStreet,
      //   propCurrentStreet: currentStreet,
      //   actionSlots: store.streets[store.currentStreet]?.actionSlots
      // });

      // Try to force generate action slots based on the prop street
      if (
        store.generateActionSlots &&
        currentStreet &&
        ['flop', 'turn', 'river'].includes(currentStreet)
      ) {
        // console.log('[PlayerActionDialog] Attempting to generate action slots for prop street:', currentStreet);
        const streetEnum = currentStreet as Street;
        // console.log('[PlayerActionDialog] Final fallback attempt for street:', streetEnum);
        store.generateActionSlots(streetEnum);

        // Try one more time to get the slot
        const finalSlot = store.getCurrentActionSlot();
        if (finalSlot && finalSlot.playerId === player.id) {
          const numericAmount = amount ? parseFloat(amount) : undefined;
          store.processAction(finalSlot.id, actualAction, numericAmount).then((success) => {
            if (success) {
              setTimeout(() => {
                onOpenChange(false);
                setIsSubmitting(false);
              }, 50);
            } else {
              setIsSubmitting(false);
              alert('Unable to process action. Please try again.');
            }
          });
          return;
        }
      }

      setIsSubmitting(false);
      // Don't close dialog - let user try again
      alert('Unable to process action. Please try again.');
    }

    // ALSO try to update form data for UI consistency (but don't fail if this fails)
    if (updateAction) {
      try {
        const validIndex = actionIndex >= 0 ? actionIndex : 0;
        updateAction(currentStreet, validIndex, actualAction, amount || betAmount);
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
            {store.eventAdapter &&
            store.engineState &&
            store.engineState.currentState &&
            store.engineState.currentState.players ? (
              <span className="block mt-2">
                Current Bet: ${store.engineState.currentState.betting?.currentBet || 0} | To Call: $
                {(() => {
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
                availableActions={(() => {
                  // If we have event adapter and loading is complete, prefer engine actions
                  // Only fall back to hook actions if we don't have event adapter
                  const shouldUseFallback =
                    !store.eventAdapter || (validActions.length === 0 && !isLoadingActions);
                  const finalActions = shouldUseFallback ? availableActions : validActions;

                  // Debug logging (disabled for production)
                  return finalActions;
                })()}
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

          {/* Show waiting message if not player's turn */}
          {store.eventAdapter &&
            validActions.length === 0 &&
            !isLoadingActions &&
            store.engineState?.currentState?.betting?.actionOn &&
            store.engineState.currentState.betting.actionOn !== player.id && (
              <div className="text-center text-muted-foreground mt-4 space-y-2">
                <p className="text-xs text-yellow-500">
                  Waiting for {store.engineState.currentState.betting.actionOn} to act
                </p>
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerActionDialog;
