import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { ShareHandFormData } from '@/types/shareHand';
import { steps, getPositionName } from '@/utils/shareHandConstants';
import { getAvailableActions, getActionButtonClass } from '@/utils/shareHandActions';
import { validateCurrentStep } from '@/utils/shareHandValidation';
import {
  calculatePotSize,
  getCurrencySymbol,
  getAllSelectedCards,
} from '@/utils/shareHandCalculations';
import { sharedHandsStore } from '@/stores/sharedHandsStore';
import { useActionManagement } from './useActionManagement';

export const useShareHandLogic = () => {
  const router = useRouter();
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

      // Add hand to store and navigate to feed
      sharedHandsStore.addHand(formData, tags);

      toast({
        title: 'Success',
        description: 'Hand shared successfully!',
      });

      router.push('/feed');
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
  }, [currentStep, formData, tags, router]);

  // Updated getAvailableActions to accept all parameters
  const getAvailableActionsWithParams = useCallback(
    (street: string, index: number, allActions: any[]) => {
      try {
        return getAvailableActions(street, index, allActions);
      } catch {
        return [];
      }
    },
    [],
  );

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
