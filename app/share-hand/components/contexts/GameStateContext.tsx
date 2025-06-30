'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useGameStateUI } from '@/hooks/useGameStateUI';

interface GameStateContextValue {
  gameStateUI: ReturnType<typeof useGameStateUI>;
}

const GameStateContext = createContext<GameStateContextValue | null>(null);

export const useGameStateContext = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameStateContext must be used within GameStateProvider');
  }
  return context;
};

export const GameStateProvider = ({ children }: { children: React.ReactNode }) => {
  const gameStateUI = useGameStateUI();

  const value = useMemo(
    () => ({
      gameStateUI,
    }),
    [gameStateUI],
  );

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
};