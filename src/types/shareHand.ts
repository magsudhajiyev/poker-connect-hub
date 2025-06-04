
export interface ActionStep {
  playerId: string;
  playerName: string;
  isHero: boolean;
  action?: string;
  betAmount?: string;
  completed: boolean;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  stackSize: number[];
  isHero?: boolean;
}

export interface ShareHandFormData {
  gameType: string;
  gameFormat: string;
  stackSize: string;
  heroPosition: string;
  villainPosition: string;
  heroStackSize: number[];
  villainStackSize: number[];
  players?: Player[];
  holeCards: string[];
  flopCards: string[];
  turnCard: string[];
  riverCard: string[];
  preflopActions: ActionStep[];
  preflopDescription: string;
  flopActions: ActionStep[];
  flopDescription: string;
  turnActions: ActionStep[];
  turnDescription: string;
  riverActions: ActionStep[];
  riverDescription: string;
  title: string;
  description: string;
  smallBlind: string;
  bigBlind: string;
  ante: boolean;
}

export type StreetType = 'preflopActions' | 'flopActions' | 'turnActions' | 'riverActions';

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export interface StepInfo {
  id: string;
  title: string;
  description: string;
}
