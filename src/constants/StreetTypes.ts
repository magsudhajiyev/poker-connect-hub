/**
 * Poker Street/Round Types
 * Defines the different betting rounds in a poker hand
 */
export enum StreetType {
  PREFLOP = 'preflopActions',
  FLOP = 'flopActions', 
  TURN = 'turnActions',
  RIVER = 'riverActions'
}

/**
 * Game round types (without 'Actions' suffix)
 */
export enum GameRound {
  PREFLOP = 'preflop',
  FLOP = 'flop',
  TURN = 'turn',
  RIVER = 'river',
  SHOWDOWN = 'showdown'
}

/**
 * Street order for navigation
 */
export const STREET_ORDER = [
  StreetType.PREFLOP,
  StreetType.FLOP,
  StreetType.TURN,
  StreetType.RIVER
] as const;

/**
 * Game round order
 */
export const GAME_ROUND_ORDER = [
  GameRound.PREFLOP,
  GameRound.FLOP,
  GameRound.TURN,
  GameRound.RIVER,
  GameRound.SHOWDOWN
] as const;

/**
 * Convert street type to game round
 */
export const streetToGameRound = (street: StreetType): GameRound => {
  switch (street) {
    case StreetType.PREFLOP:
      return GameRound.PREFLOP;
    case StreetType.FLOP:
      return GameRound.FLOP;
    case StreetType.TURN:
      return GameRound.TURN;
    case StreetType.RIVER:
      return GameRound.RIVER;
    default:
      return GameRound.PREFLOP;
  }
};

/**
 * Convert game round to street type
 */
export const gameRoundToStreet = (round: GameRound): StreetType => {
  switch (round) {
    case GameRound.PREFLOP:
      return StreetType.PREFLOP;
    case GameRound.FLOP:
      return StreetType.FLOP;
    case GameRound.TURN:
      return StreetType.TURN;
    case GameRound.RIVER:
      return StreetType.RIVER;
    default:
      return StreetType.PREFLOP;
  }
};