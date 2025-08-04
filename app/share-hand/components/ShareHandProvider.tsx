'use client';

import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { useShareHandLogic } from '@/hooks/useShareHandLogic';
import { useHandBuilder } from '@/poker-engine/hooks/useHandBuilder';
import { ActionType, Street, GameType, GameFormat } from '@/types/poker';
import { toast } from '@/hooks/use-toast';
import { usePokerHandStore } from '@/stores/poker-hand-store';
import { validatePositions } from '@/utils/positionValidation';

interface ShareHandContextType {
  // From useShareHandLogic
  formData: ReturnType<typeof useShareHandLogic>['formData'];
  setFormData: ReturnType<typeof useShareHandLogic>['setFormData'];
  currentStep: ReturnType<typeof useShareHandLogic>['currentStep'];
  setCurrentStep: ReturnType<typeof useShareHandLogic>['setCurrentStep'];
  steps: ReturnType<typeof useShareHandLogic>['steps'];
  prevStep: ReturnType<typeof useShareHandLogic>['prevStep'];
  nextStep: ReturnType<typeof useShareHandLogic>['nextStep'];
  handleSubmit: ReturnType<typeof useShareHandLogic>['handleSubmit'];

  // Tag management
  tags: ReturnType<typeof useShareHandLogic>['tags'];
  addTag: ReturnType<typeof useShareHandLogic>['addTag'];
  removeTag: ReturnType<typeof useShareHandLogic>['removeTag'];

  // Utility methods
  getPositionName: ReturnType<typeof useShareHandLogic>['getPositionName'];
  getCurrencySymbol: ReturnType<typeof useShareHandLogic>['getCurrencySymbol'];
  calculatePotSize: ReturnType<typeof useShareHandLogic>['calculatePotSize'];
  getAllSelectedCards: ReturnType<typeof useShareHandLogic>['getAllSelectedCards'];

  // Action management
  getAvailableActions: ReturnType<typeof useShareHandLogic>['getAvailableActions'];
  updateAction: ReturnType<typeof useShareHandLogic>['updateAction'];
  getActionButtonClass: ReturnType<typeof useShareHandLogic>['getActionButtonClass'];
  handleBetSizeSelect: ReturnType<typeof useShareHandLogic>['handleBetSizeSelect'];

  // From new poker engine
  engineState: ReturnType<typeof useHandBuilder>['state'] | null;
  currentPlayer: ReturnType<typeof useHandBuilder>['currentPlayer'];
  legalActions: ReturnType<typeof useHandBuilder>['legalActions'];
  processAction: (playerId: string, action: ActionType, amount?: number) => void;

  // Helper methods
  initializeGame: () => Promise<void>;
  isGameInitialized: boolean;
  currentStreet: Street;
  pot: number;
  players: Array<any>;
}

const ShareHandContext = createContext<ShareHandContextType | null>(null);

export const useShareHandContext = () => {
  const context = useContext(ShareHandContext);
  if (!context) {
    throw new Error('useShareHandContext must be used within ShareHandProvider');
  }
  return context;
};

interface ShareHandProviderProps {
  children: React.ReactNode;
}

export const ShareHandProvider = ({ children }: ShareHandProviderProps) => {
  const shareHandLogic = useShareHandLogic();
  const handBuilder = useHandBuilder();
  const store = usePokerHandStore();

  // Track if game is initialized
  const [isGameInitialized, setIsGameInitialized] = React.useState(false);
  
  // Subscribe to player updates to ensure UI refreshes
  const players = usePokerHandStore(state => state.players);
  

  // Use the engine's current street when available, otherwise calculate from step
  const currentStreet = useMemo((): Street => {
    // If engine is initialized and has a current street, use that
    if (store.isEngineInitialized && store.currentStreet) {
      return store.currentStreet;
    }
    
    // Otherwise fall back to step-based calculation
    if (shareHandLogic.currentStep < 2) {
      return Street.PREFLOP;
    }
    const streetMap: Street[] = [Street.PREFLOP, Street.FLOP, Street.TURN, Street.RIVER];
    return streetMap[shareHandLogic.currentStep - 2] || Street.PREFLOP;
  }, [shareHandLogic.currentStep, store.isEngineInitialized, store.currentStreet]);

  // Initialize game when players are set up
  const initializeGame = useCallback(async () => {
    const { players } = shareHandLogic.formData;
    if (!players || players.length < 2) {
      toast({
        title: 'Error',
        description: 'At least 2 players required to start the game',
        variant: 'destructive',
      });
      return;
    }

    // Check if players have positions assigned
    const hasValidPositions = players.every((p) => p.position && p.position !== '');

    if (!hasValidPositions) {
      toast({
        title: 'Invalid Setup',
        description: 'All players must have positions assigned',
        variant: 'destructive',
      });
      return;
    }

    // Validate position configuration
    const positions = players.map(p => p.position);
    const validation = validatePositions(positions);
    
    if (!validation.isValid) {
      toast({
        title: 'Invalid Position Configuration',
        description: validation.error,
        variant: 'destructive',
      });
      
      if (validation.suggestion) {
        toast({
          title: 'Suggestion',
          description: validation.suggestion,
        });
      }
      return;
    }

    // Use players as-is without modifying positions
    const processedPlayers = [...players];

    // Use Zustand store for initialization
    const gameConfig = {
      gameType: GameType.NLH,
      gameFormat: GameFormat.CASH,
      blinds: {
        small: parseInt(shareHandLogic.formData.smallBlind) || 1,
        big: parseInt(shareHandLogic.formData.bigBlind) || 2,
      },
    };

    // Create hand with event sourcing
    const handId = await store.createHandWithEventSourcing(processedPlayers, gameConfig);
    if (handId) {
      await store.initializeGame(processedPlayers, gameConfig);
      setIsGameInitialized(true);

      // Deal hero cards if available
      const hero = processedPlayers.find((p) => p.isHero);
      if (hero && shareHandLogic.formData.holeCards.length === 2) {
        store.dealCards(hero.id, shareHandLogic.formData.holeCards, Street.PREFLOP);
      }
    } else {
      // Fallback to legacy for testing
      await store.initializeGame(processedPlayers, gameConfig);
      setIsGameInitialized(true);

      // Deal hero cards if available
      const hero = processedPlayers.find((p) => p.isHero);
      if (hero && shareHandLogic.formData.holeCards.length === 2) {
        store.dealCards(hero.id, shareHandLogic.formData.holeCards, Street.PREFLOP);
      }

      // Keep legacy handBuilder for backward compatibility
      const result = handBuilder.initializeHand(processedPlayers);
      if (result.isValid) {
        if (hero && shareHandLogic.formData.holeCards.length === 2) {
          handBuilder.dealCards(hero.id, shareHandLogic.formData.holeCards, Street.PREFLOP);
        }
      }
    }
  }, [
    shareHandLogic.formData.players,
    shareHandLogic.formData.holeCards,
    shareHandLogic.formData.smallBlind,
    shareHandLogic.formData.bigBlind,
    handBuilder,
    store,
  ]);

  // Initialize game when moving past positions step
  useEffect(() => {
    if (shareHandLogic.currentStep === 2 && !isGameInitialized) {
      initializeGame();
    }
  }, [shareHandLogic.currentStep, isGameInitialized, initializeGame]);

  // Deal hole cards when they change during preflop
  useEffect(() => {
    if (isGameInitialized && shareHandLogic.currentStep === 2 && shareHandLogic.formData.holeCards.length === 2) {
      const hero = shareHandLogic.formData.players?.find((p: any) => p.isHero);
      if (hero && store.dealCards) {
        store.dealCards(hero.id, shareHandLogic.formData.holeCards, Street.PREFLOP);
      }
    }
  }, [shareHandLogic.formData.holeCards, isGameInitialized, shareHandLogic.currentStep, shareHandLogic.formData.players, store]);

  // Sync UI step with engine street changes
  useEffect(() => {
    if (store.isEngineInitialized && store.currentStreet) {
      // Map engine street to UI step
      const streetToStep: Record<Street, number> = {
        [Street.PREFLOP]: 2,
        [Street.FLOP]: 3,
        [Street.TURN]: 4,
        [Street.RIVER]: 5,
      };
      
      const targetStep = streetToStep[store.currentStreet];
      if (targetStep && targetStep !== shareHandLogic.currentStep) {
        // Engine has advanced to a new street, sync the UI
        shareHandLogic.setCurrentStep(targetStep);
      }
    }
  }, [store.currentStreet, store.isEngineInitialized, shareHandLogic.currentStep, shareHandLogic.setCurrentStep]);

  // Process action wrapper with validation
  const processAction = useCallback(
    async (playerId: string, action: ActionType, amount?: number) => {
      // Use store for action processing if game is initialized
      if (store.isEngineInitialized) {
        const currentSlot = store.getCurrentActionSlot();
        if (currentSlot && currentSlot.playerId === playerId) {
          const success = await store.processAction(currentSlot.id, action, amount);
          if (!success) {
            toast({
              title: 'Invalid Action',
              description: 'This action is not allowed',
              variant: 'destructive',
            });
            return;
          }

          // Update legacy form data for backward compatibility
          const streetKey = `${currentStreet}Actions` as keyof typeof shareHandLogic.formData;
          const updatedActions = store.formData[streetKey] || [];
          shareHandLogic.setFormData({
            ...shareHandLogic.formData,
            [streetKey]: updatedActions,
          });

          return;
        }
      }

      // Fallback to legacy handBuilder
      const result = handBuilder.processAction(playerId, action, amount);

      if (!result.isValid) {
        toast({
          title: 'Invalid Action',
          description: result.error || 'This action is not allowed',
          variant: 'destructive',
        });
        return;
      }

      // Update form data to reflect the action
      const streetKey = `${currentStreet}Actions` as keyof typeof shareHandLogic.formData;
      const currentActions = (shareHandLogic.formData[streetKey] as any[]) || [];
      const player = handBuilder.state.currentState.players.get(playerId);

      if (player) {
        const newAction = {
          playerId,
          playerName: player.name,
          isHero: player.isHero,
          action,
          betAmount: amount?.toString(),
          completed: true,
          position: player.position,
        };

        shareHandLogic.setFormData({
          ...shareHandLogic.formData,
          [streetKey]: [...currentActions, newAction],
        });
      }
    },
    [handBuilder, currentStreet, shareHandLogic, store],
  );

  // Sync the step with the engine's street when it advances
  useEffect(() => {
    if (!store.isEngineInitialized || !isGameInitialized) {
      return;
    }

    // Map streets to steps
    const streetToStep: Record<Street, number> = {
      [Street.PREFLOP]: 2,
      [Street.FLOP]: 3,
      [Street.TURN]: 4,
      [Street.RIVER]: 5,
    };

    const targetStep = streetToStep[store.currentStreet];
    if (targetStep && targetStep !== shareHandLogic.currentStep) {
      // Street has advanced, update the step
      shareHandLogic.setCurrentStep(targetStep);
    }
  }, [store.currentStreet, store.isEngineInitialized, isGameInitialized, shareHandLogic]);

  // Deal community cards when advancing streets
  useEffect(() => {
    if (!isGameInitialized) {
      return;
    }

    const dealCommunityCards = () => {
      // Use store's formData when engine is initialized, otherwise use shareHandLogic's
      const formData = store.isEngineInitialized ? store.formData : shareHandLogic.formData;
      const { flopCards, turnCard, riverCard } = formData;

      // Only deal cards to the legacy handBuilder if we're not using event sourcing
      if (!store.eventAdapter) {
        switch (currentStreet) {
          case Street.FLOP:
            if (flopCards.length === 3) {
              handBuilder.dealCards(null, flopCards, Street.FLOP);
            }
            break;
          case Street.TURN:
            if (turnCard.length === 1) {
              handBuilder.dealCards(null, turnCard, Street.TURN);
            }
            break;
          case Street.RIVER:
            if (riverCard.length === 1) {
              handBuilder.dealCards(null, riverCard, Street.RIVER);
            }
            break;
        }
      }
      
      // For event sourcing, community cards are handled by the engine
      // We just need to update the store if cards are available but not dealt
      if (store.eventAdapter && store.dealCards) {
        switch (currentStreet) {
          case Street.FLOP:
            if (flopCards.length === 3 && store.streets.flop.communityCards.length === 0) {
              store.dealCards(null, flopCards, Street.FLOP);
            }
            break;
          case Street.TURN:
            if (turnCard.length === 1 && store.streets.turn.communityCards.length === 0) {
              store.dealCards(null, turnCard, Street.TURN);
            }
            break;
          case Street.RIVER:
            if (riverCard.length === 1 && store.streets.river.communityCards.length === 0) {
              store.dealCards(null, riverCard, Street.RIVER);
            }
            break;
        }
      }
    };

    dealCommunityCards();
  }, [currentStreet, isGameInitialized, shareHandLogic.formData, handBuilder, store]);

  // Custom nextStep that handles street advancement
  const customNextStep = useCallback(() => {
    // If betting round is complete and we're on a street step, advance the street
    if (store.isBettingRoundComplete && shareHandLogic.currentStep >= 2 && shareHandLogic.currentStep <= 5) {
      store.advanceToNextStreet();
    }
    // Always advance to the next step
    shareHandLogic.nextStep();
  }, [store, shareHandLogic]);

  // Create a unified setFormData that updates both store and local state
  const unifiedSetFormData = useCallback((newFormData: any) => {
    shareHandLogic.setFormData(newFormData);
    if (store.isEngineInitialized) {
      store.updateFormData(newFormData);
    }
  }, [shareHandLogic, store]);

  const contextValue: ShareHandContextType = {
    // From useShareHandLogic
    formData: store.isEngineInitialized ? store.formData : shareHandLogic.formData,
    setFormData: unifiedSetFormData,
    currentStep: shareHandLogic.currentStep,
    setCurrentStep: shareHandLogic.setCurrentStep,
    steps: shareHandLogic.steps,
    prevStep: shareHandLogic.prevStep,
    nextStep: customNextStep,
    handleSubmit: shareHandLogic.handleSubmit,

    // Tag management
    tags: shareHandLogic.tags,
    addTag: shareHandLogic.addTag,
    removeTag: shareHandLogic.removeTag,

    // Utility methods
    getPositionName: shareHandLogic.getPositionName,
    getCurrencySymbol: shareHandLogic.getCurrencySymbol,
    calculatePotSize: shareHandLogic.calculatePotSize,
    getAllSelectedCards: shareHandLogic.getAllSelectedCards,

    // Action management
    getAvailableActions: shareHandLogic.getAvailableActions,
    updateAction: shareHandLogic.updateAction,
    getActionButtonClass: shareHandLogic.getActionButtonClass,
    handleBetSizeSelect: shareHandLogic.handleBetSizeSelect,

    // From new poker engine - use store data when available
    engineState: store.isEngineInitialized ? (store.engineState as any) : handBuilder.state || ({} as any),
    currentPlayer: store.isEngineInitialized
      ? (store.getCurrentPlayer() as any)
      : handBuilder.currentPlayer,
    legalActions: store.isEngineInitialized ? store.getLegalActions() : handBuilder.legalActions,
    processAction,

    // Helper methods
    initializeGame,
    isGameInitialized: store.isEngineInitialized || isGameInitialized,
    currentStreet,
    pot: store.isEngineInitialized ? store.engineState?.currentState?.betting?.pot || 0 : handBuilder.pot,
    players: store.isEngineInitialized ? players : handBuilder.players, // Use subscribed players
  };

  return <ShareHandContext.Provider value={contextValue}>{children}</ShareHandContext.Provider>;
};
