// Core poker types used throughout the application

export enum Position {
  UTG = 'utg',
  UTG1 = 'utg1',
  HJ = 'hj',
  LJ = 'lj',
  MP = 'mp',
  CO = 'co',
  BTN = 'btn',
  SB = 'sb',
  BB = 'bb',
}

export enum Street {
  PREFLOP = 'preflop',
  FLOP = 'flop',
  TURN = 'turn',
  RIVER = 'river',
}

export enum ActionType {
  FOLD = 'fold',
  CHECK = 'check',
  CALL = 'call',
  BET = 'bet',
  RAISE = 'raise',
  ALL_IN = 'all-in',
}

export enum GameType {
  NLH = 'nlh',
  PLO = 'plo',
}

export enum GameFormat {
  CASH = 'cash',
  TOURNAMENT = 'tournament',
}

export interface Card {
  rank: string;
  suit: string;
}

export interface ChipAmount {
  value: number;
  currency?: string;
}
