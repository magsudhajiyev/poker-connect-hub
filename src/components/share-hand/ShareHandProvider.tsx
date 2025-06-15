
import React, { createContext, useContext, useEffect } from 'react';
import { useShareHandLogic } from '@/hooks/useShareHandLogic';
import { useGameStateUI } from '@/hooks/useGameStateUI';
import { useActionManagement } from '@/hooks/useActionManagement';

const ShareHandContext = createContext<ReturnType<typeof useShareHandLogic> & { gameStateUI: ReturnType<typeof useGameStateUI> } | null>(null);

export const useShareHandContext = () => {
  const context = useContext(ShareHandContext);
  if (!context) {
    console.error('❌ CRITICAL: useShareHandContext called outside ShareHandProvider!');
    throw new Error('useShareHandContext must be used within ShareHandProvider');
  }
  return context;
};

interface ShareHandProviderProps {
  children: React.ReactNode;
}

export const ShareHandProvider = ({ children }: ShareHandProviderProps) => {
  console.log('🚀 DEBUGGING: ShareHandProvider rendering');

  const shareHandLogic = useShareHandLogic();
  const gameStateUI = useGameStateUI();
  
  console.log('🔍 DEBUGGING: ShareHandProvider hooks initialized:', {
    shareHandLogicExists: !!shareHandLogic,
    gameStateUIExists: !!gameStateUI,
    formDataExists: !!shareHandLogic?.formData
  });
  
  const actionManagement = useActionManagement(shareHandLogic.formData, shareHandLogic.setFormData, gameStateUI);

  // Initialize game when players are set up
  useEffect(() => {
    console.log('🚀 DEBUGGING: ShareHandProvider useEffect triggered');
    
    const { formData } = shareHandLogic;
    
    console.log('🔍 DEBUGGING: ShareHandProvider effect data:', {
      formDataExists: !!formData,
      players: formData?.players,
      smallBlind: formData?.smallBlind,
      bigBlind: formData?.bigBlind
    });
    
    // Validate all required data is present
    const hasValidPlayers = formData.players && formData.players.length >= 2;
    const hasValidBlinds = formData.smallBlind && formData.bigBlind;
    const allPlayersHavePositions = formData.players?.every(p => p.position && p.position.trim() !== '');
    
    console.log('🔍 DEBUGGING: Validation results:', {
      hasValidPlayers,
      hasValidBlinds,
      allPlayersHavePositions
    });
    
    if (hasValidPlayers && hasValidBlinds && allPlayersHavePositions) {
      
      const smallBlind = parseFloat(formData.smallBlind);
      const bigBlind = parseFloat(formData.bigBlind);
      
      // Validate numeric values
      if (!isNaN(smallBlind) && !isNaN(bigBlind) && smallBlind > 0 && bigBlind > 0) {
        console.log('✅ DEBUGGING: Initializing game with players:', formData.players);
        console.log('✅ DEBUGGING: Small blind:', smallBlind, 'Big blind:', bigBlind);
        gameStateUI.initializeGame(formData.players, smallBlind, bigBlind);
      } else {
        console.warn('❌ DEBUGGING: Invalid blind values:', { smallBlind, bigBlind });
      }
    } else {
      console.log('⏭️ DEBUGGING: Game initialization skipped - missing requirements:', {
        hasValidPlayers,
        hasValidBlinds,
        allPlayersHavePositions,
        players: formData.players
      });
    }
  }, [shareHandLogic.formData.players, shareHandLogic.formData.smallBlind, shareHandLogic.formData.bigBlind, gameStateUI]);

  const contextValue = { ...shareHandLogic, gameStateUI };
  
  console.log('✅ DEBUGGING: ShareHandProvider providing context:', {
    contextExists: !!contextValue,
    contextKeys: Object.keys(contextValue),
    formDataInContext: !!contextValue.formData
  });

  return (
    <ShareHandContext.Provider value={contextValue}>
      {children}
    </ShareHandContext.Provider>
  );
};
