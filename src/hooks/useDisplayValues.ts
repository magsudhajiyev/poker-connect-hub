import { useMemo, useCallback } from 'react';
import { ShareHandFormData } from '@/types/shareHand';

export type DisplayMode = 'chips'; // Simplified - always use chips
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

export const useDisplayValues = ({ formData, _displayMode }: UseDisplayValuesProps) => {
  // Always use chips mode for simplified currency system
  const effectiveDisplayMode = useMemo((): DisplayMode => {
    return 'chips'; // Always chips regardless of game format
  }, []);

  // Parse blind values safely
  const { smallBlind, bigBlind } = useMemo(() => {
    const sb = parseFloat(formData.smallBlind || '1');
    const bb = parseFloat(formData.bigBlind || '2');
    return {
      smallBlind: isNaN(sb) ? 1 : sb,
      bigBlind: isNaN(bb) ? 2 : bb,
    };
  }, [formData.smallBlind, formData.bigBlind]);

  // Simplified conversion functions - everything is in chips
  const convertToChips = useCallback((amount: number): number => {
    return amount; // No conversion needed - always chips
  }, []);

  const convertFromChips = useCallback((chipAmount: number): number => {
    return chipAmount; // No conversion needed - always chips
  }, []);

  // Display configuration based on game format
  const getDisplayConfig = useCallback(() => {
    const isCash = formData.gameFormat === 'cash';
    return {
      unit: 'chips',
      symbol: isCash ? '$' : '', // Cash shows $, MTT shows no symbol
      decimals: isCash ? 2 : 0, // Cash shows decimals, MTT shows whole numbers
      name: isCash ? 'Chips' : 'Chips',
    };
  }, [formData.gameFormat]);

  // Format large numbers for display (10K, 1.2M, etc.)
  const formatLargeNumber = useCallback((amount: number): string => {
    if (amount >= 1000000) {
      const millions = amount / 1000000;
      return `${millions.toFixed(millions >= 10 ? 0 : 1)}M`;
    } else if (amount >= 1000) {
      const thousands = amount / 1000;
      return `${thousands.toFixed(thousands >= 10 ? 0 : 1)}K`;
    }
    return amount.toString();
  }, []);

  // Format a chip amount for display with large number support
  const formatChipAmount = useCallback(
    (chipAmount: number, useLargeFormat: boolean = false): DisplayValue => {
      const config = getDisplayConfig();

      // Round to prevent floating point precision issues
      const roundedAmount = Math.round(chipAmount * 100) / 100;

      // Use large number format for stack displays if requested
      const displayText =
        useLargeFormat && roundedAmount >= 1000
          ? formatLargeNumber(roundedAmount)
          : roundedAmount.toFixed(roundedAmount < 1000 ? config.decimals : 0);

      return {
        amount: roundedAmount,
        unit: config.unit,
        symbol: config.symbol,
        formatted: `${config.symbol}${displayText}`,
      };
    },
    [getDisplayConfig, formatLargeNumber],
  );

  // Format pot amount for display (separate from stack formatting)
  const formatPotAmount = useCallback(
    (chipAmount: number): DisplayValue => {
      const config = getDisplayConfig();

      // Round to prevent floating point precision issues
      const roundedAmount = Math.round(chipAmount * 100) / 100;

      // Pot displays use regular numbers, not large format
      const displayText = roundedAmount.toFixed(config.decimals);

      return {
        amount: roundedAmount,
        unit: config.unit,
        symbol: config.symbol,
        formatted: `${config.symbol}${displayText}`,
      };
    },
    [getDisplayConfig],
  );

  // Format stack size for display with large number support
  const formatStackSize = useCallback(
    (stackSize: number | number[]): DisplayValue => {
      const chipAmount = Array.isArray(stackSize) ? stackSize[0] : stackSize;
      return formatChipAmount(chipAmount, true); // Use large format for stacks
    },
    [formatChipAmount],
  );

  // Parse user input - always in chips now
  const parseInputToChips = useCallback((input: string): number => {
    const amount = parseFloat(input);
    if (isNaN(amount)) {
      return 0;
    }
    return amount; // No conversion needed - always chips
  }, []);

  // Validate bet amount in chips
  const validateBetAmount = useCallback(
    (
      chipAmount: number,
      playerChipStack: number,
    ): {
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
    },
    [bigBlind, formatChipAmount],
  );

  // Calculate pot-based bet sizes in chips
  const calculatePotBetSizes = useCallback(
    (potChips: number, playerChipStack: number) => {
      const sizes = [
        { label: '1/3 Pot', percentage: 33.33, chipAmount: Math.round((potChips / 3) * 100) / 100 },
        { label: '1/2 Pot', percentage: 50, chipAmount: Math.round((potChips / 2) * 100) / 100 },
        { label: '3/4 Pot', percentage: 75, chipAmount: Math.round(potChips * 0.75 * 100) / 100 },
        { label: 'Pot', percentage: 100, chipAmount: potChips },
        { label: 'All-in', percentage: 100, chipAmount: playerChipStack },
      ];

      return sizes.map((size) => ({
        ...size,
        chipAmount: Math.min(size.chipAmount, playerChipStack),
        displayValue: formatChipAmount(Math.min(size.chipAmount, playerChipStack)),
        isAllIn: size.chipAmount >= playerChipStack,
      }));
    },
    [formatChipAmount],
  );

  return {
    // State
    effectiveDisplayMode,
    smallBlind,
    bigBlind,

    // Core conversions (simplified)
    convertToChips,
    convertFromChips,

    // Display formatting
    formatChipAmount,
    formatPotAmount,
    formatStackSize,
    formatLargeNumber,
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
