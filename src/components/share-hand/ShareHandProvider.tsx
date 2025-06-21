
import React, { createContext, useContext, useEffect, useRef, useMemo, useCallback } from 'react';
import { useShareHandLogic } from '@/hooks/useShareHandLogic';
import { useGameStateUI } from '@/hooks/useGameStateUI';
import { useActionFlow } from '@/hooks/useActionFlow';
import { usePokerApiEngine } from '@/hooks/usePokerApiEngine';
import { useErrorHandler } from '@/components/error-boundary';

const ShareHandContext = createContext<ReturnType<typeof useShareHandLogic> & { 
  gameStateUI: ReturnType<typeof useGameStateUI>;
  pokerActions: ReturnType<typeof useActionFlow>;
  pokerApiEngine: ReturnType<typeof usePokerApiEngine>;
  useApiEngine: boolean;
} | null>(null);

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
  const gameStateUI = useGameStateUI();
  const initializeGameRef = useRef(false);
  
  // Feature flag to use API-based engine (can be controlled via env var or user preference)
  const useApiEngine = import.meta.env.VITE_USE_API_ENGINE === 'true' || false;
  
  // Memoize current street calculation to prevent unnecessary re-renders
  const getCurrentStreet = useCallback(() => {
    if (shareHandLogic.currentStep < 2) {
      return 'preflopActions';
    }
    const streetMap = ['preflopActions', 'flopActions', 'turnActions', 'riverActions'];
    return streetMap[shareHandLogic.currentStep - 2] || 'preflopActions';
  }, [shareHandLogic.currentStep]);

  // Memoize current street value
  const currentStreet = useMemo(() => getCurrentStreet(), [getCurrentStreet]);

  // Memoize parsed blinds to prevent unnecessary recalculations
  const blinds = useMemo(() => ({
    smallBlind: parseFloat(shareHandLogic.formData.smallBlind || '1'),
    bigBlind: parseFloat(shareHandLogic.formData.bigBlind || '2'),
  }), [shareHandLogic.formData.smallBlind, shareHandLogic.formData.bigBlind]);
  
  // Initialize simplified action flow with memoized values
  const pokerActions = useActionFlow(
    shareHandLogic.formData.players || [],
    blinds.smallBlind,
    blinds.bigBlind,
    currentStreet,
  );
  
  // Initialize API-based poker engine
  const pokerApiEngine = usePokerApiEngine({
    players: shareHandLogic.formData.players || [],
    smallBlind: shareHandLogic.formData.smallBlind || '1',
    bigBlind: shareHandLogic.formData.bigBlind || '2',
    currentStreet: currentStreet,
  });
  
  // Provider context state management

  // Memoize validation checks to prevent unnecessary recalculations
  const gameValidation = useMemo(() => {
    const { formData } = shareHandLogic;
    const hasValidPlayers = formData.players && formData.players.length >= 2;
    const hasValidBlinds = formData.smallBlind && formData.bigBlind;
    const allPlayersHavePositions = formData.players?.every(p => p.position && p.position.trim() !== '');
    
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
    shareHandLogic.formData.players?.map(p => p.position).join(','),
  ]);

  // Initialize game when players are set up - use ref to prevent infinite loops
  useEffect(() => {
    const { formData } = shareHandLogic;
    const { hasValidPlayers, hasValidBlinds, allPlayersHavePositions } = gameValidation;
    
    if (hasValidPlayers && hasValidBlinds && allPlayersHavePositions && !initializeGameRef.current) {
      // Validate numeric values using memoized blinds
      if (!isNaN(blinds.smallBlind) && !isNaN(blinds.bigBlind) && blinds.smallBlind > 0 && blinds.bigBlind > 0) {
        // Initialize game with validated players
        gameStateUI.initializeGame(formData.players, blinds.smallBlind, blinds.bigBlind);
        initializeGameRef.current = true;
      }
    }
    
    // Reset the ref when players change significantly
    if (!hasValidPlayers || !hasValidBlinds || !allPlayersHavePositions) {
      initializeGameRef.current = false;
    }
  }, [gameValidation, blinds, shareHandLogic.formData.players, gameStateUI]);

  // Memoize context value to prevent unnecessary re-renders of children
  const contextValue = useMemo(() => ({
    ...shareHandLogic,
    gameStateUI,
    pokerActions,
    pokerApiEngine,
    useApiEngine,
  }), [shareHandLogic, gameStateUI, pokerActions, pokerApiEngine, useApiEngine]);

  return (
    <ShareHandContext.Provider value={contextValue}>
      {children}
    </ShareHandContext.Provider>
  );
};
