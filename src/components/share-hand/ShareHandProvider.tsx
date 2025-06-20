
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useShareHandLogic } from '@/hooks/useShareHandLogic';
import { useGameStateUI } from '@/hooks/useGameStateUI';
import { useActionFlow } from '@/hooks/useActionFlow';

const ShareHandContext = createContext<ReturnType<typeof useShareHandLogic> & { 
  gameStateUI: ReturnType<typeof useGameStateUI>;
  pokerActions: ReturnType<typeof useActionFlow>;
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
  
  // Get current street based on step
  const getCurrentStreet = () => {
    if (shareHandLogic.currentStep < 2) return 'preflopActions';
    const streetMap = ['preflopActions', 'flopActions', 'turnActions', 'riverActions'];
    return streetMap[shareHandLogic.currentStep - 2] || 'preflopActions';
  };
  
  // Initialize simplified action flow
  const pokerActions = useActionFlow(
    shareHandLogic.formData.players || [],
    parseFloat(shareHandLogic.formData.smallBlind || '1'),
    parseFloat(shareHandLogic.formData.bigBlind || '2'),
    getCurrentStreet()
  );
  
  console.log('PROVIDER DEBUG:', {
    hasPlayers: shareHandLogic.formData.players?.length || 0,
    currentStreet: getCurrentStreet(),
    actionFlowState: {
      currentPlayer: pokerActions.currentPlayer?.name,
      currentPlayerPosition: pokerActions.currentPlayer?.position,
      pot: pokerActions.pot,
      isRoundComplete: pokerActions.isRoundComplete,
      areAllActivePlayersAllIn: typeof pokerActions.areAllActivePlayersAllIn
    }
  });

  // Initialize game when players are set up - use ref to prevent infinite loops
  useEffect(() => {
    const { formData } = shareHandLogic;
    
    // Validate all required data is present
    const hasValidPlayers = formData.players && formData.players.length >= 2;
    const hasValidBlinds = formData.smallBlind && formData.bigBlind;
    const allPlayersHavePositions = formData.players?.every(p => p.position && p.position.trim() !== '');
    
    if (hasValidPlayers && hasValidBlinds && allPlayersHavePositions && !initializeGameRef.current) {
      const smallBlind = parseFloat(formData.smallBlind);
      const bigBlind = parseFloat(formData.bigBlind);
      
      // Validate numeric values
      if (!isNaN(smallBlind) && !isNaN(bigBlind) && smallBlind > 0 && bigBlind > 0) {
        console.log('Initializing game with players:', formData.players.length);
        gameStateUI.initializeGame(formData.players, smallBlind, bigBlind);
        initializeGameRef.current = true;
      }
    }
    
    // Reset the ref when players change significantly
    if (!hasValidPlayers || !hasValidBlinds || !allPlayersHavePositions) {
      initializeGameRef.current = false;
    }
  }, [shareHandLogic.formData.players?.length, shareHandLogic.formData.smallBlind, shareHandLogic.formData.bigBlind]);

  return (
    <ShareHandContext.Provider value={{ ...shareHandLogic, gameStateUI, pokerActions }}>
      {children}
    </ShareHandContext.Provider>
  );
};
