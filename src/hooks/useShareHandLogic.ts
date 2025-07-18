import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { ShareHandFormData, ActionStep } from '@/types/shareHand';
import { steps, getPositionName } from '@/utils/shareHandConstants';
// Removed old shareHandActions imports - using new state machine architecture
import { validateCurrentStep } from '@/utils/shareHandValidation';
import {
  calculatePotSize,
  getCurrencySymbol,
  getAllSelectedCards,
} from '@/utils/shareHandCalculations';
import { sharedHandsApi, PlayerPosition, HoleCards, PokerAction } from '@/services/sharedHandsApi';
import { useActionManagement } from './useActionManagement';
import { useProfileData } from './useProfileData';
import { useAuth } from '@/contexts/AuthContext';

export const useShareHandLogic = () => {
  const router = useRouter();
  const { userData } = useProfileData();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [tags, setTags] = useState<string[]>(['bluff', 'tournament']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ShareHandFormData>({
    gameType: '',
    gameFormat: '',
    stackSize: '',
    heroPosition: '',
    villainPosition: '',
    heroStackSize: [100],
    villainStackSize: [100],
    players: [], // Initialize as empty array instead of undefined
    holeCards: [] as string[],
    flopCards: [] as string[],
    turnCard: [] as string[],
    riverCard: [] as string[],
    preflopActions: [] as any[],
    preflopDescription: '',
    flopActions: [] as any[],
    flopDescription: '',
    turnActions: [] as any[],
    turnDescription: '',
    riverActions: [] as any[],
    riverDescription: '',
    title: '',
    description: '',
    smallBlind: '',
    bigBlind: '',
    ante: false,
  });

  const { updateAction, handleBetSizeSelect } = useActionManagement(formData, setFormData);

  // Clear error when form data changes
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [formData, error]);

  // Remove the automatic initialization to prevent infinite loops
  // Actions will be initialized manually when needed

  const addTag = useCallback(
    (tag: string) => {
      try {
        if (tag && !tags.includes(tag)) {
          setTags((prev) => [...prev, tag]);
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to add tag',
          variant: 'destructive',
        });
      }
    },
    [tags],
  );

  const removeTag = useCallback((tagToRemove: string) => {
    try {
      setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove tag',
        variant: 'destructive',
      });
    }
  }, []);

  const nextStep = useCallback(() => {
    try {
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
        setError(null);
      }
    } catch {
      setError('Failed to proceed to next step');
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    try {
      if (currentStep > 0) {
        setCurrentStep((prev) => prev - 1);
        setError(null);
      }
    } catch {
      setError('Failed to go back to previous step');
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const validation = validateCurrentStep(currentStep, formData);
      if (!validation.isValid) {
        if (validation.message) {
          setError(validation.message);
          toast({
            title: 'Validation Error',
            description: validation.message,
            variant: 'destructive',
          });
        }
        return;
      }

      // Prepare data for backend
      // Convert players array to positions record
      const positionsRecord: Record<string, PlayerPosition> = {};
      formData.players?.forEach((player) => {
        positionsRecord[player.position] = {
          name: player.name,
          chips: Array.isArray(player.stackSize) ? player.stackSize[0] : player.stackSize,
          isHero: player.isHero,
        };
      });

      // Convert hole cards to preflopCards record
      const preflopCardsRecord: Record<string, HoleCards> = {};
      if (formData.holeCards) {
        const heroPlayer = formData.players?.find((p) => p.isHero);
        if (heroPlayer) {
          preflopCardsRecord[heroPlayer.position] = {
            card1: formData.holeCards[0] || '',
            card2: formData.holeCards[1] || '',
          };
        }
      }

      // Helper to convert ActionStep to PokerAction
      const convertActionsToPokerActions = (actions?: ActionStep[]): PokerAction[] => {
        if (!actions) {
          return [];
        }
        return actions.map((action) => ({
          playerId: action.playerId,
          playerName: action.playerName,
          action: action.action || '',
          amount: action.betAmount ? parseFloat(action.betAmount) : undefined,
          position: action.position,
          isHero: action.isHero,
        }));
      };

      const sharedHandData = {
        title: formData.title || 'Untitled Hand',
        description: formData.description || '',
        gameType: formData.gameType,
        gameFormat: formData.gameFormat,
        tableSize: formData.players?.length || 2,
        positions: positionsRecord,
        preflopCards: preflopCardsRecord,
        preflopActions: convertActionsToPokerActions(formData.preflopActions),
        flopCards: formData.flopCards,
        flopActions: convertActionsToPokerActions(formData.flopActions),
        turnCard: formData.turnCard?.[0] || '',
        turnActions: convertActionsToPokerActions(formData.turnActions),
        riverCard: formData.riverCard?.[0] || '',
        riverActions: convertActionsToPokerActions(formData.riverActions),
        analysis: {
          preflopDescription: formData.preflopDescription,
          flopDescription: formData.flopDescription,
          turnDescription: formData.turnDescription,
          riverDescription: formData.riverDescription,
        },
        tags,
        isPublic: true,
      };

      // Save to backend
      const response = await sharedHandsApi.createSharedHand(sharedHandData);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to share hand');
      }

      toast({
        title: 'Success',
        description: 'Hand shared successfully!',
      });

      // Navigate to the hand view page
      router.push(`/hand-view/${response.data._id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit hand';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, formData, tags, router, userData, user]);

  // Simple implementation for legacy compatibility
  const getAvailableActionsWithParams = useCallback(() => {
    // Basic actions available for all players
    return ['fold', 'check', 'call', 'bet', 'raise', 'all-in'];
  }, []);

  // Simple action button class implementation
  const getActionButtonClass = useCallback((_action: string, isSelected: boolean) => {
    const baseClass = 'transition-all duration-200 border';
    const selectedClass = isSelected
      ? 'bg-blue-600 text-white border-blue-600'
      : 'bg-gray-800 text-gray-300 border-gray-600';
    return `${baseClass} ${selectedClass}`;
  }, []);

  // Memoized calculations to prevent unnecessary re-renders
  const potSize = useMemo(() => {
    try {
      return calculatePotSize(formData);
    } catch {
      return 0;
    }
  }, [formData]);

  const currencySymbol = useMemo(() => {
    try {
      return getCurrencySymbol(formData.gameFormat);
    } catch {
      return '$';
    }
  }, [formData.gameFormat]);

  const allSelectedCards = useMemo(() => {
    try {
      return getAllSelectedCards(formData);
    } catch {
      return [];
    }
  }, [formData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    currentStep,
    setCurrentStep,
    tags,
    formData,
    setFormData,
    steps,
    isLoading,
    error,
    clearError,
    getPositionName,
    getAvailableActions: getAvailableActionsWithParams,
    getActionButtonClass,
    updateAction,
    handleBetSizeSelect,
    calculatePotSize: () => potSize,
    getCurrencySymbol: () => currencySymbol,
    getAllSelectedCards: () => allSelectedCards,
    addTag,
    removeTag,
    nextStep,
    prevStep,
    handleSubmit,
  };
};
