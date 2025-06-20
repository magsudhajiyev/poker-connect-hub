/**
 * Poker Game Constants
 * Contains magic numbers and configuration values used throughout the poker game
 */

/**
 * Default values for game setup
 */
export const DEFAULT_VALUES = {
  SMALL_BLIND: 1,
  BIG_BLIND: 2,
  STACK_SIZE: 100,
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 9
} as const;

/**
 * Betting constraints
 */
export const BETTING_CONSTRAINTS = {
  MIN_BET_MULTIPLIER: 1, // Minimum bet is 1x big blind
  MIN_RAISE_MULTIPLIER: 2, // Minimum raise is 2x current bet
  MAX_SEARCH_ITERATIONS: 20 // Prevent infinite loops in player search
} as const;

/**
 * UI and animation constants
 */
export const UI_CONSTANTS = {
  MAX_BET_AMOUNT_DISPLAY_LENGTH: 10,
  ANIMATION_DELAY_MS: 100,
  STATE_UPDATE_TIMEOUT_MS: 50
} as const;

/**
 * Game state constants
 */
export const GAME_STATE = {
  INCOMPLETE_ACTION_INDEX: -1,
  FIRST_PLAYER_INDEX: 0,
  ROUND_COMPLETE_THRESHOLD: 1 // Minimum active players for round completion
} as const;

/**
 * Validation messages
 */
export const VALIDATION_MESSAGES = {
  INVALID_BET_AMOUNT: 'Invalid bet amount',
  INVALID_RAISE_AMOUNT: 'Invalid raise amount', 
  CANNOT_CHECK_WITH_BET: 'Cannot check when there\'s a bet to call',
  CANNOT_CALL_WITHOUT_BET: 'Cannot call when there\'s no bet',
  CANNOT_BET_WITH_EXISTING_BET: 'Cannot bet when there\'s already a bet',
  CANNOT_RAISE_WITHOUT_BET: 'Cannot raise when there\'s no bet',
  NOT_PLAYER_TURN: 'Not this player\'s turn',
  INVALID_ACTION: 'Invalid action'
} as const;

/**
 * Console log messages for better debugging
 */
export const LOG_MESSAGES = {
  ACTION_FLOW_INITIALIZED: 'ACTION FLOW INITIALIZED',
  ACTION_FLOW_RESET: 'ACTION FLOW RESET',
  STATE_UPDATE: 'STATE UPDATE',
  CHECKING_ROUND_COMPLETION: 'CHECKING ROUND COMPLETION',
  ROUND_COMPLETE: 'ROUND COMPLETE',
  NEXT_PLAYER: 'NEXT PLAYER',
  PLAYER_FOLDED: 'folded and will be removed from all future action',
  EXECUTING_ACTION: 'EXECUTING ACTION',
  RAISE_VALIDATION: 'RAISE VALIDATION',
  RAISE_EXECUTED: 'RAISE EXECUTED'
} as const;