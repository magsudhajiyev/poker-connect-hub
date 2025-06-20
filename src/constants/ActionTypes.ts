/**
 * Poker Action Types
 * Defines all possible actions a player can take during a poker hand
 */
export enum ActionType {
  FOLD = 'fold',
  CHECK = 'check',
  CALL = 'call',
  BET = 'bet',
  RAISE = 'raise',
  ALL_IN = 'all-in'
}

/**
 * Actions that require a bet amount
 */
export const BETTING_ACTIONS = [ActionType.BET, ActionType.RAISE] as const;

/**
 * Actions that end a player's participation in the hand
 */
export const ENDING_ACTIONS = [ActionType.FOLD] as const;

/**
 * Actions that continue the action to the next player
 */
export const CONTINUING_ACTIONS = [
  ActionType.BET, 
  ActionType.RAISE, 
  ActionType.CALL
] as const;

/**
 * Check if an action requires a bet amount
 */
export const requiresBetAmount = (action: ActionType): boolean => {
  return BETTING_ACTIONS.includes(action as any);
};

/**
 * Check if an action should add a next action step
 */
export const shouldAddNextAction = (action: ActionType): boolean => {
  return CONTINUING_ACTIONS.includes(action as any);
};