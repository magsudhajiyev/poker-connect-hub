
import React, { createContext, useContext, useEffect } from 'react';
import { useShareHandLogic } from '@/hooks/useShareHandLogic';
import { useGameStateUI } from '@/hooks/useGameStateUI';

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

  // Initialize game when players are set up
  useEffect(() => {
    const { formData } = shareHandLogic;
    
    if (formData.players && formData.players.length >= 2 && 
        formData.smallBlind && formData.bigBlind &&
        formData.players.every(p => p.position)) {
      
      const smallBlind = parseFloat(formData.smallBlind);
      const bigBlind = parseFloat(formData.bigBlind);
      
      console.log('Initializing game with players:', formData.players);
      gameStateUI.initializeGame(formData.players, smallBlind, bigBlind);
    }
  }, [shareHandLogic.formData.players, shareHandLogic.formData.smallBlind, shareHandLogic.formData.bigBlind, gameStateUI]);

  return (
    <ShareHandContext.Provider value={{ ...shareHandLogic, gameStateUI }}>
      {children}
    </ShareHandContext.Provider>
  );
};
