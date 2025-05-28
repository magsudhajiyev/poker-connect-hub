
import React, { createContext, useContext } from 'react';
import { useShareHandLogic } from '@/hooks/useShareHandLogic';

const ShareHandContext = createContext<ReturnType<typeof useShareHandLogic> | null>(null);

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

  return (
    <ShareHandContext.Provider value={shareHandLogic}>
      {children}
    </ShareHandContext.Provider>
  );
};
