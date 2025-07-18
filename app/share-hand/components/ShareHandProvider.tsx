'use client';

import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { useShareHandLogic } from '@/hooks/useShareHandLogic';
import { useHandBuilder } from '@/poker-engine/hooks/useHandBuilder';
import { ActionType, Street, GameType, GameFormat } from '@/types/poker';
import { toast } from '@/hooks/use-toast';
import { usePokerHandStore } from '@/stores/poker-hand-store';

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
  initializeGame: () => void;
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

  // Calculate current street based on step
  const currentStreet = useMemo((): Street => {
    if (shareHandLogic.currentStep < 2) {
      return Street.PREFLOP;
    }
    const streetMap: Street[] = [Street.PREFLOP, Street.FLOP, Street.TURN, Street.RIVER];
    return streetMap[shareHandLogic.currentStep - 2] || Street.PREFLOP;
  }, [shareHandLogic.currentStep]);

  // Initialize game when players are set up
  const initializeGame = useCallback(() => {
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
      return;
    }

    // Auto-assign button position if missing
    let processedPlayers = [...players];
    const hasButton = players.some((p) => p.position === 'btn');

    if (!hasButton) {
      // Find a suitable player to be button (prefer CO > HJ > MP > UTG, avoid blinds)
      const buttonCandidates = players.filter((p) => !['sb', 'bb'].includes(p.position));
      const preferredPositions = ['co', 'hj', 'mp', 'utg'];

      let buttonPlayer = null;
      for (const pos of preferredPositions) {
        buttonPlayer = buttonCandidates.find((p) => p.position === pos);
        if (buttonPlayer) {
          break;
        }
      }

      // If no preferred position, use the first non-blind player
      if (!buttonPlayer && buttonCandidates.length > 0) {
        buttonPlayer = buttonCandidates[0];
      }

      if (buttonPlayer) {
        processedPlayers = processedPlayers.map((p) =>
          p.id === buttonPlayer.id ? { ...p, position: 'btn' } : p,
        );
      } else {
        return;
      }
    }

    // Use Zustand store for initialization
    const gameConfig = {
      gameType: GameType.NLH,
      gameFormat: GameFormat.CASH,
      blinds: {
        small: parseInt(shareHandLogic.formData.smallBlind) || 1,
        big: parseInt(shareHandLogic.formData.bigBlind) || 2,
      },
    };

    store.initializeGame(processedPlayers, gameConfig);
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

  // Deal community cards when advancing streets
  useEffect(() => {
    if (!isGameInitialized) {
      return;
    }

    const dealCommunityCards = () => {
      const { flopCards, turnCard, riverCard } = shareHandLogic.formData;

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
    };

    dealCommunityCards();
  }, [currentStreet, isGameInitialized, shareHandLogic.formData, handBuilder]);

  const contextValue: ShareHandContextType = {
    // From useShareHandLogic
    formData: store.isEngineInitialized ? store.formData : shareHandLogic.formData,
    setFormData: shareHandLogic.setFormData,
    currentStep: shareHandLogic.currentStep,
    setCurrentStep: shareHandLogic.setCurrentStep,
    steps: shareHandLogic.steps,
    prevStep: shareHandLogic.prevStep,
    nextStep: shareHandLogic.nextStep,
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
    engineState: store.isEngineInitialized ? store.engineState : handBuilder.state || ({} as any),
    currentPlayer: store.isEngineInitialized
      ? (store.getCurrentPlayer() as any)
      : handBuilder.currentPlayer,
    legalActions: store.isEngineInitialized ? store.getLegalActions() : handBuilder.legalActions,
    processAction,

    // Helper methods
    initializeGame,
    isGameInitialized: store.isEngineInitialized || isGameInitialized,
    currentStreet,
    pot: store.isEngineInitialized ? store.streets[currentStreet]?.pot || 0 : handBuilder.pot,
    players: store.isEngineInitialized ? store.players : handBuilder.players,
  };

  return <ShareHandContext.Provider value={contextValue}>{children}</ShareHandContext.Provider>;
};
