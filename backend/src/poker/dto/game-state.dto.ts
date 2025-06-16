import { IsString, IsNumber, IsArray, IsBoolean, IsIn, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CardDto {
  @IsIn(['hearts', 'diamonds', 'clubs', 'spades'])
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';

  @IsIn(['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'])
  rank: '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
}

export class PlayerDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  chips: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardDto)
  holeCards: CardDto[];

  @IsNumber()
  position: number;

  @IsBoolean()
  isActive: boolean;

  @IsBoolean()
  hasActed: boolean;

  @IsNumber()
  currentBet: number;

  @IsBoolean()
  isFolded: boolean;

  @IsBoolean()
  isAllIn: boolean;
}

export class GameStateDto {
  @IsString()
  gameId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlayerDto)
  players: PlayerDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardDto)
  communityCards: CardDto[];

  @IsNumber()
  pot: number;

  @IsNumber()
  currentBet: number;

  @IsNumber()
  minRaise: number;

  @IsNumber()
  bigBlind: number;

  @IsNumber()
  smallBlind: number;

  @IsNumber()
  currentPlayerIndex: number;

  @IsNumber()
  dealerPosition: number;

  @IsIn(['preflop', 'flop', 'turn', 'river', 'showdown'])
  gamePhase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

  @IsNumber()
  bettingRound: number;
}

export class GetLegalActionsDto {
  @ValidateNested()
  @Type(() => GameStateDto)
  gameState: GameStateDto;

  @IsString()
  @IsOptional()
  playerId?: string;
}
