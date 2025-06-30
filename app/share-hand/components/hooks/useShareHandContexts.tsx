'use client';

// Re-export hooks with backward compatibility
export { useShareHandContext } from '../ShareHandProviderOptimized';
export { useGameStateContext } from '../contexts/GameStateContext';
export { usePokerActionsContext } from '../contexts/PokerActionsContext';

// New combined hook that provides the same interface as the old useShareHandContext
import { useShareHandProviderContext } from '../ShareHandProviderOptimized';
export const useShareHandContextCompat = useShareHandProviderContext;