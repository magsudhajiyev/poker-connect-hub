import React, { createContext, useContext, useEffect } from 'react';
import { useShareHandLogic } from '@/hooks/useShareHandLogic';
import { useGameStateUI } from '@/hooks/useGameStateUI';
import { useActionManagement } from '@/hooks/useActionManagement';

const ShareHandContext = createContext<ReturnType<typeof useShareHandLogic> & { gameStateUI: ReturnType<typeof useGameStateUI> } | null>(null);

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
  
  const actionManagement = useActionManagement(shareHandLogic.formData, shareHandLogic.setFormData, gameStateUI);

  // Initialize game when players are set up
  useEffect(() => {
    const { formData } = shareHandLogic;
    
    // Validate all required data is present
    const hasValidPlayers = formData.players && formData.players.length >= 2;
    const hasValidBlinds = formData.smallBlind && formData.bigBlind;
    const allPlayersHavePositions = formData.players?.every(p => p.position && p.position.trim() !== '');
    
    if (hasValidPlayers && hasValidBlinds && allPlayersHavePositions) {
      
      const smallBlind = parseFloat(formData.smallBlind);
      const bigBlind = parseFloat(formData.bigBlind);
      
      // Validate numeric values
      if (!isNaN(smallBlind) && !isNaN(bigBlind) && smallBlind > 0 && bigBlind > 0) {
        console.log('Initializing game with players:', formData.players);
        console.log('Small blind:', smallBlind, 'Big blind:', bigBlind);
        gameStateUI.initializeGame(formData.players, smallBlind, bigBlind);
      } else {
        console.warn('Invalid blind values:', { smallBlind, bigBlind });
      }
    } else {
      console.log('Game initialization skipped - missing requirements:', {
        hasValidPlayers,
        hasValidBlinds,
        allPlayersHavePositions,
        players: formData.players
      });
    }
  }, [shareHandLogic.formData.players, shareHandLogic.formData.smallBlind, shareHandLogic.formData.bigBlind, gameStateUI]);

  return (
    <ShareHandContext.Provider value={{ ...shareHandLogic, gameStateUI }}>
      {children}
    </ShareHandContext.Provider>
  );
};
