'use client';

import React, { createContext, useContext, useEffect, useRef, useMemo, useCallback } from 'react';
import { useShareHandLogic } from '@/hooks/useShareHandLogic';
import { GameStateProvider, useGameStateContext } from './contexts/GameStateContext';
import { PokerActionsProvider, usePokerActionsContext } from './contexts/PokerActionsContext';

// Main context for share hand logic
const ShareHandContext = createContext<ReturnType<typeof useShareHandLogic> | null>(null);

export const useShareHandContext = () => {
  const context = useContext(ShareHandContext);
  if (!context) {
    throw new Error('useShareHandContext must be used within ShareHandProvider');
  }
  return context;
};

// Combined hook that provides all contexts
export const useShareHandProviderContext = () => {
  const shareHandContext = useShareHandContext();
  const { gameStateUI } = useGameStateContext();
  const { pokerActions, pokerApiEngine, useApiEngine } = usePokerActionsContext();

  return {
    ...shareHandContext,
    gameStateUI,
    pokerActions,
    pokerApiEngine,
    useApiEngine,
  };
};

interface ShareHandProviderProps {
  children: React.ReactNode;
}

// Inner component that has access to all contexts
const ShareHandProviderInner = ({ children }: { children: React.ReactNode }) => {
  const shareHandLogic = useShareHandLogic();
  const { gameStateUI } = useGameStateContext();
  const initializeGameRef = useRef(false);

  // Memoize current street calculation
  const getCurrentStreet = useCallback(() => {
    if (shareHandLogic.currentStep < 2) {
      return 'preflopActions';
    }
    const streetMap = ['preflopActions', 'flopActions', 'turnActions', 'riverActions'];
    return streetMap[shareHandLogic.currentStep - 2] || 'preflopActions';
  }, [shareHandLogic.currentStep]);

  const currentStreet = useMemo(() => getCurrentStreet(), [getCurrentStreet]);

  // Memoize parsed blinds
  const blinds = useMemo(
    () => ({
      smallBlind: parseFloat(shareHandLogic.formData.smallBlind || '1'),
      bigBlind: parseFloat(shareHandLogic.formData.bigBlind || '2'),
    }),
    [shareHandLogic.formData.smallBlind, shareHandLogic.formData.bigBlind],
  );

  // Memoize players
  const players = useMemo(
    () => shareHandLogic.formData.players || [],
    [
      shareHandLogic.formData.players?.length,
      shareHandLogic.formData.players?.map((p) => p.id).join(','),
    ],
  );

  // Memoize validation checks
  const gameValidation = useMemo(() => {
    const { formData } = shareHandLogic;
    const hasValidPlayers = formData.players && formData.players.length >= 2;
    const hasValidBlinds = formData.smallBlind && formData.bigBlind;
    const allPlayersHavePositions = formData.players?.every(
      (p) => p.position && p.position.trim() !== '',
    );

    return {
      hasValidPlayers,
      hasValidBlinds,
      allPlayersHavePositions,
      playersLength: formData.players?.length || 0,
    };
  }, [
    shareHandLogic.formData.players?.length,
    shareHandLogic.formData.smallBlind,
    shareHandLogic.formData.bigBlind,
    shareHandLogic.formData.players?.map((p) => p.position).join(','),
  ]);

  // Initialize game when players are set up
  useEffect(() => {
    const { hasValidPlayers, hasValidBlinds, allPlayersHavePositions } = gameValidation;

    if (
      hasValidPlayers &&
      hasValidBlinds &&
      allPlayersHavePositions &&
      !initializeGameRef.current
    ) {
      if (
        !isNaN(blinds.smallBlind) &&
        !isNaN(blinds.bigBlind) &&
        blinds.smallBlind > 0 &&
        blinds.bigBlind > 0
      ) {
        const timeoutId = setTimeout(() => {
          if (!initializeGameRef.current) {
            gameStateUI.initializeGame(players, blinds.smallBlind, blinds.bigBlind);
            initializeGameRef.current = true;
          }
        }, 100);

        return () => clearTimeout(timeoutId);
      }
    }

    if (!hasValidPlayers || !hasValidBlinds || !allPlayersHavePositions) {
      initializeGameRef.current = false;
    }
  }, [
    gameValidation,
    blinds.smallBlind,
    blinds.bigBlind,
    players,
    gameStateUI,
  ]);

  return (
    <ShareHandContext.Provider value={shareHandLogic}>
      <PokerActionsProvider
        players={players}
        smallBlind={blinds.smallBlind}
        bigBlind={blinds.bigBlind}
        currentStreet={currentStreet}
        setFormData={shareHandLogic.setFormData}
        currentStep={shareHandLogic.currentStep}
      >
        {children}
      </PokerActionsProvider>
    </ShareHandContext.Provider>
  );
};

// Main provider that wraps all contexts
export const ShareHandProvider = ({ children }: ShareHandProviderProps) => {
  return (
    <GameStateProvider>
      <ShareHandProviderInner>{children}</ShareHandProviderInner>
    </GameStateProvider>
  );
};