import { useMemo, useCallback } from 'react';
import { ShareHandFormData } from '@/types/shareHand';

export type DisplayMode = 'chips' | 'bb';
export type GameFormat = 'cash' | 'mtt' | 'sng';

interface UseDisplayValuesProps {
  formData: ShareHandFormData;
  displayMode?: DisplayMode; // Future feature - defaults based on game format for now
}

export interface DisplayValue {
  amount: number;
  unit: string;
  symbol: string;
  formatted: string;
}

export const useDisplayValues = ({ formData, displayMode }: UseDisplayValuesProps) => {
  // Determine display mode based on game format (for now, until toggle feature is added)
  const effectiveDisplayMode = useMemo((): DisplayMode => {
    if (displayMode) {
return displayMode;
}
    return formData.gameFormat === 'cash' ? 'chips' : 'bb';
  }, [displayMode, formData.gameFormat]);

  // Parse blind values safely
  const { smallBlind, bigBlind } = useMemo(() => {
    const sb = parseFloat(formData.smallBlind || '1');
    const bb = parseFloat(formData.bigBlind || '2');
    return {
      smallBlind: isNaN(sb) ? 1 : sb,
      bigBlind: isNaN(bb) ? 2 : bb,
    };
  }, [formData.smallBlind, formData.bigBlind]);

  // Core conversion functions
  const chipsToBlindBets = useCallback((chipAmount: number): number => {
    return chipAmount / bigBlind;
  }, [bigBlind]);

  const blindBetsToChips = useCallback((bbAmount: number): number => {
    return bbAmount * bigBlind;
  }, [bigBlind]);

  // Convert any value to chips (internal standard)
  const convertToChips = useCallback((amount: number, fromUnit: DisplayMode = effectiveDisplayMode): number => {
    if (fromUnit === 'chips') {
return amount;
}
    return blindBetsToChips(amount);
  }, [blindBetsToChips, effectiveDisplayMode]);

  // Convert chips to display unit
  const convertFromChips = useCallback((chipAmount: number, toUnit: DisplayMode = effectiveDisplayMode): number => {
    if (toUnit === 'chips') {
return chipAmount;
}
    return chipsToBlindBets(chipAmount);
  }, [chipsToBlindBets, effectiveDisplayMode]);

  // Get display configuration for current mode
  const getDisplayConfig = useCallback((mode: DisplayMode = effectiveDisplayMode) => {
    return {
      chips: {
        unit: 'chips',
        symbol: '$',
        decimals: 2,
        name: 'Chips',
      },
      bb: {
        unit: 'bb',
        symbol: 'BB',
        decimals: 1,
        name: 'Big Blinds',
      },
    }[mode];
  }, [effectiveDisplayMode]);

  // Format a chip amount for display
  const formatChipAmount = useCallback((chipAmount: number, targetMode: DisplayMode = effectiveDisplayMode): DisplayValue => {
    const config = getDisplayConfig(targetMode);
    const displayAmount = convertFromChips(chipAmount, targetMode);
    
    // More aggressive rounding to prevent floating point precision issues
    const multiplier = Math.pow(10, config.decimals);
    const roundedAmount = Math.round(displayAmount * multiplier) / multiplier;
    
    // Additional check to remove unnecessary trailing zeros after decimal
    const finalAmount = parseFloat(roundedAmount.toFixed(config.decimals));
    
    return {
      amount: finalAmount,
      unit: config.unit,
      symbol: config.symbol,
      formatted: `${config.symbol}${finalAmount.toFixed(config.decimals)}`,
    };
  }, [convertFromChips, getDisplayConfig, effectiveDisplayMode]);

  // Format stack size for display (handles both single number and array formats)
  const formatStackSize = useCallback((stackSize: number | number[], targetMode: DisplayMode = effectiveDisplayMode): DisplayValue => {
    const chipAmount = Array.isArray(stackSize) ? stackSize[0] : stackSize;
    return formatChipAmount(chipAmount, targetMode);
  }, [formatChipAmount, effectiveDisplayMode]);

  // Parse user input and convert to chips
  const parseInputToChips = useCallback((input: string, fromMode: DisplayMode = effectiveDisplayMode): number => {
    const amount = parseFloat(input);
    if (isNaN(amount)) {
return 0;
}
    return convertToChips(amount, fromMode);
  }, [convertToChips, effectiveDisplayMode]);

  // Validate bet amount in chips
  const validateBetAmount = useCallback((chipAmount: number, playerChipStack: number): {
    isValid: boolean;
    error?: string;
    adjustedAmount?: number;
  } => {
    if (chipAmount <= 0) {
      return { isValid: false, error: 'Bet amount must be greater than 0' };
    }

    if (chipAmount > playerChipStack) {
      // Auto-adjust to all-in
      return {
        isValid: true,
        adjustedAmount: playerChipStack,
        error: `Bet adjusted to all-in (${formatChipAmount(playerChipStack).formatted})`,
      };
    }

    // Check minimum bet (typically 1 BB)
    if (chipAmount < bigBlind) {
      return {
        isValid: false,
        error: `Minimum bet is ${formatChipAmount(bigBlind).formatted}`,
      };
    }

    return { isValid: true };
  }, [bigBlind, formatChipAmount]);

  // Calculate pot-based bet sizes in chips
  const calculatePotBetSizes = useCallback((potChips: number, playerChipStack: number) => {
    const sizes = [
      { label: '1/3 Pot', percentage: 33.33, chipAmount: Math.round((potChips / 3) * 100) / 100 },
      { label: '1/2 Pot', percentage: 50, chipAmount: Math.round((potChips / 2) * 100) / 100 },
      { label: '3/4 Pot', percentage: 75, chipAmount: Math.round((potChips * 0.75) * 100) / 100 },
      { label: 'Pot', percentage: 100, chipAmount: potChips },
      { label: 'All-in', percentage: 100, chipAmount: playerChipStack },
    ];

    return sizes.map(size => ({
      ...size,
      chipAmount: Math.min(size.chipAmount, playerChipStack),
      displayValue: formatChipAmount(Math.min(size.chipAmount, playerChipStack)),
      isAllIn: size.chipAmount >= playerChipStack,
    }));
  }, [formatChipAmount]);

  return {
    // State
    effectiveDisplayMode,
    smallBlind,
    bigBlind,
    
    // Core conversions
    chipsToBlindBets,
    blindBetsToChips,
    convertToChips,
    convertFromChips,
    
    // Display formatting
    formatChipAmount,
    formatStackSize,
    getDisplayConfig,
    
    // Input parsing and validation
    parseInputToChips,
    validateBetAmount,
    
    // Betting calculations
    calculatePotBetSizes,
    
    // Utility functions
    getCurrentSymbol: () => getDisplayConfig().symbol,
    getCurrentUnit: () => getDisplayConfig().unit,
    getMinimumBet: () => bigBlind,
  };
};