/**
 * Poker Position Types
 * Defines all possible player positions at a poker table
 */
export enum Position {
  UTG = 'utg',
  UTG_PLUS_ONE = 'utg1', 
  MIDDLE_POSITION = 'mp',
  LOJACK = 'lj',
  HIJACK = 'hj',
  CUTOFF = 'co',
  BUTTON = 'btn',
  SMALL_BLIND = 'sb',
  BIG_BLIND = 'bb'
}

/**
 * Action order for preflop betting
 * UTG acts first, BB acts last
 */
export const PREFLOP_ACTION_ORDER = [
  Position.UTG,
  Position.UTG_PLUS_ONE,
  Position.MIDDLE_POSITION,
  Position.LOJACK,
  Position.HIJACK,
  Position.CUTOFF,
  Position.BUTTON,
  Position.SMALL_BLIND,
  Position.BIG_BLIND
] as const;

/**
 * Action order for postflop betting
 * SB acts first, Button acts last
 */
export const POSTFLOP_ACTION_ORDER = [
  Position.SMALL_BLIND,
  Position.BIG_BLIND,
  Position.UTG,
  Position.UTG_PLUS_ONE,
  Position.MIDDLE_POSITION,
  Position.LOJACK,
  Position.HIJACK,
  Position.CUTOFF,
  Position.BUTTON
] as const;

/**
 * All positions in clockwise order around the table
 */
export const ALL_POSITIONS = [
  Position.UTG,
  Position.UTG_PLUS_ONE,
  Position.MIDDLE_POSITION,
  Position.LOJACK,
  Position.HIJACK,
  Position.CUTOFF,
  Position.BUTTON,
  Position.SMALL_BLIND,
  Position.BIG_BLIND
] as const;

/**
 * Blind positions
 */
export const BLIND_POSITIONS = [
  Position.SMALL_BLIND,
  Position.BIG_BLIND
] as const;

/**
 * Get action order for a specific street
 */
export const getActionOrder = (isPreflop: boolean): readonly Position[] => {
  return isPreflop ? PREFLOP_ACTION_ORDER : POSTFLOP_ACTION_ORDER;
};

/**
 * Check if position is a blind
 */
export const isBlindPosition = (position: Position): boolean => {
  return BLIND_POSITIONS.includes(position as any);
};

/**
 * Position display names
 */
export const POSITION_NAMES: Record<Position, string> = {
  [Position.UTG]: 'UTG',
  [Position.UTG_PLUS_ONE]: 'UTG+1',
  [Position.MIDDLE_POSITION]: 'MP',
  [Position.LOJACK]: 'LJ',
  [Position.HIJACK]: 'HJ',
  [Position.CUTOFF]: 'CO',
  [Position.BUTTON]: 'BTN',
  [Position.SMALL_BLIND]: 'SB',
  [Position.BIG_BLIND]: 'BB'
};