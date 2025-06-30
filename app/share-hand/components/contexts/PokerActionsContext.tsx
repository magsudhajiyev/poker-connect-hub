'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useActionFlow } from '@/hooks/useActionFlow';
import { usePokerApiEngine } from '@/hooks/usePokerApiEngine';
import { Player } from '@/types/shareHand';

interface PokerActionsContextValue {
  pokerActions: ReturnType<typeof useActionFlow>;
  pokerApiEngine: ReturnType<typeof usePokerApiEngine>;
  useApiEngine: boolean;
}

const PokerActionsContext = createContext<PokerActionsContextValue | null>(null);

export const usePokerActionsContext = () => {
  const context = useContext(PokerActionsContext);
  if (!context) {
    throw new Error('usePokerActionsContext must be used within PokerActionsProvider');
  }
  return context;
};

interface PokerActionsProviderProps {
  children: React.ReactNode;
  players: Player[];
  smallBlind: number;
  bigBlind: number;
  currentStreet: string;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  currentStep: number;
}

export const PokerActionsProvider = ({
  children,
  players,
  smallBlind,
  bigBlind,
  currentStreet,
  setFormData,
  currentStep,
}: PokerActionsProviderProps) => {
  // Feature flag to use API-based engine
  const useApiEngine = process.env.NEXT_PUBLIC_USE_API_ENGINE === 'true' || false;

  // Initialize action flow
  const pokerActions = useActionFlow(
    players,
    smallBlind,
    bigBlind,
    currentStreet,
    setFormData,
    currentStep,
  );

  // Initialize API-based poker engine only when we have valid player data
  const pokerApiEngine = usePokerApiEngine({
    players: currentStep > 1 ? players : [],
    smallBlind: smallBlind.toString(),
    bigBlind: bigBlind.toString(),
    currentStreet,
  });

  const value = useMemo(
    () => ({
      pokerActions,
      pokerApiEngine,
      useApiEngine,
    }),
    [pokerActions, pokerApiEngine, useApiEngine],
  );

  return <PokerActionsContext.Provider value={value}>{children}</PokerActionsContext.Provider>;
};