export interface PositionValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

/**
 * Validates if a set of player positions is valid for a poker game
 */
export function validatePositions(positions: string[]): PositionValidationResult {
  const normalizedPositions = positions.map(p => p.toLowerCase());
  const playerCount = positions.length;

  // Must have at least 2 players
  if (playerCount < 2) {
    return {
      isValid: false,
      error: 'At least 2 players are required',
    };
  }

  // Check for duplicate positions
  const uniquePositions = new Set(normalizedPositions);
  if (uniquePositions.size !== playerCount) {
    return {
      isValid: false,
      error: 'Each player must have a unique position',
    };
  }

  // Validate position names
  const validPositions = ['utg', 'utg1', 'mp', 'lj', 'hj', 'co', 'btn', 'sb', 'bb'];
  const invalidPositions = normalizedPositions.filter(p => !validPositions.includes(p));
  
  if (invalidPositions.length > 0) {
    return {
      isValid: false,
      error: `Invalid position(s): ${invalidPositions.join(', ')}`,
      suggestion: 'Use standard position abbreviations: UTG, MP, CO, BTN, SB, BB',
    };
  }

  // For 2 players, we have two scenarios:
  // 1. True heads-up: BTN vs BB (button posts SB, BB posts BB)
  // 2. Partial hand: Any two positions (e.g., UTG vs SB after others folded)
  if (playerCount === 2) {
    const hasButton = normalizedPositions.includes('btn');
    const hasBB = normalizedPositions.includes('bb');
    
    // True heads-up configuration
    if (hasButton && hasBB) {
      return { isValid: true };
    }
    
    // Partial hand scenario - any two valid positions are allowed
    // This represents a hand where other players have folded
    return { isValid: true };
  }

  // For 3+ players, we support:
  // 1. Full table configurations (with BTN and blinds)
  // 2. Partial hand scenarios (e.g., UTG vs SB vs BB after others folded)
  
  // Check if this looks like a partial hand scenario
  const hasButton = normalizedPositions.includes('btn');
  const hasSB = normalizedPositions.includes('sb');
  const hasBB = normalizedPositions.includes('bb');
  
  // If we have a button, we need proper blind structure
  if (hasButton) {
    if (!hasSB && !hasBB) {
      return {
        isValid: false,
        error: 'Games with a Button (BTN) require at least one blind position',
        suggestion: 'Add Small Blind (SB) and/or Big Blind (BB) positions',
      };
    }
  }
  
  // For partial hands without button (e.g., UTG vs MP vs SB), 
  // we allow any valid combination of positions
  // The action order will be determined by standard poker rules
  
  return { isValid: true };
}

/**
 * Suggests valid position configurations based on player count
 */
export function suggestPositions(playerCount: number): string[] {
  switch (playerCount) {
    case 2:
      return ['BTN', 'BB'];
    case 3:
      return ['BTN', 'SB', 'BB'];
    case 4:
      return ['CO', 'BTN', 'SB', 'BB'];
    case 5:
      return ['HJ', 'CO', 'BTN', 'SB', 'BB'];
    case 6:
      return ['MP', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
    case 7:
      return ['UTG', 'MP', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
    case 8:
      return ['UTG', 'UTG1', 'MP', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
    case 9:
      return ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'];
    default:
      return [];
  }
}

/**
 * Checks if a position configuration requires special handling
 */
export function isSpecialConfiguration(positions: string[]): boolean {
  const normalizedPositions = positions.map(p => p.toLowerCase());
  
  // Check for non-standard configurations like UTG vs SB
  const hasUTG = normalizedPositions.includes('utg');
  const hasSB = normalizedPositions.includes('sb');
  const noBB = !normalizedPositions.includes('bb');
  const noButton = !normalizedPositions.includes('btn');
  
  // Special configuration if we have positions but missing standard ones
  return (hasUTG && hasSB && noBB) || noButton;
}