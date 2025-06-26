// Conversion utilities between frontend, unified, and backend data formats

import { UnifiedPlayer, UnifiedGameState, Card, ConversionUtils } from '@/types/unified';
import { Player as FrontendPlayer } from '@/types/shareHand';

/**
 * Convert frontend Player to UnifiedPlayer
 */
export function frontendPlayerToUnified(frontendPlayer: FrontendPlayer): UnifiedPlayer {
  return {
    id: frontendPlayer.id,
    name: frontendPlayer.name,
    position: frontendPlayer.position,
    chips: Array.isArray(frontendPlayer.stackSize)
      ? frontendPlayer.stackSize[0] || 0
      : (frontendPlayer.stackSize as any) || 0,
    isHero: frontendPlayer.isHero,
    currentBet: 0,
    isActive: true,
    hasActed: false,
    isFolded: false,
    isAllIn: false,
    holeCards: [],
  };
}

/**
 * Convert UnifiedPlayer to backend Player format
 */
export function unifiedPlayerToBackend(unifiedPlayer: UnifiedPlayer): any {
  return {
    id: unifiedPlayer.id,
    name: unifiedPlayer.name,
    chips: unifiedPlayer.chips,
    holeCards: unifiedPlayer.holeCards || [],
    position: unifiedPlayer.positionIndex || 0,
    isActive: unifiedPlayer.isActive || true,
    hasActed: unifiedPlayer.hasActed || false,
    currentBet: unifiedPlayer.currentBet || 0,
    isFolded: unifiedPlayer.isFolded || false,
    isAllIn: unifiedPlayer.isAllIn || false,
  };
}

/**
 * Convert backend Player to UnifiedPlayer
 */
export function backendPlayerToUnified(backendPlayer: any): UnifiedPlayer {
  return {
    id: backendPlayer.id,
    name: backendPlayer.name,
    position: getPositionString(backendPlayer.position),
    positionIndex: backendPlayer.position,
    chips: backendPlayer.chips,
    holeCards: backendPlayer.holeCards || [],
    currentBet: backendPlayer.currentBet || 0,
    isActive: backendPlayer.isActive,
    hasActed: backendPlayer.hasActed,
    isFolded: backendPlayer.isFolded,
    isAllIn: backendPlayer.isAllIn,
  };
}

/**
 * Convert position index to position string
 */
function getPositionString(positionIndex: number): string {
  const positions = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
  return positions[positionIndex % positions.length] || 'UTG';
}

/**
 * Convert position string to position index
 */
function _getPositionIndex(position: string): number {
  const positionMap: { [key: string]: number } = {
    UTG: 0,
    MP: 1,
    CO: 2,
    BTN: 3,
    SB: 4,
    BB: 5,
    sb: 4,
    bb: 5,
  };
  return positionMap[position] || 0;
}

/**
 * Convert string to Card object
 */
export function stringToCard(cardString: string): Card | null {
  if (!cardString || cardString.length < 2) {
    return null;
  }

  const rank = cardString.slice(0, -1) as Card['rank'];
  const suitChar = cardString.slice(-1).toLowerCase();

  const suitMap: { [key: string]: Card['suit'] } = {
    h: 'hearts',
    d: 'diamonds',
    c: 'clubs',
    s: 'spades',
  };

  const suit = suitMap[suitChar];

  if (!suit) {
    return null;
  }

  const validRanks: Card['rank'][] = [
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
    'A',
  ];
  if (!validRanks.includes(rank)) {
    return null;
  }

  return { suit, rank };
}

/**
 * Convert Card object to string
 */
export function cardToString(card: Card): string {
  const suitMap: { [key in Card['suit']]: string } = {
    hearts: 'h',
    diamonds: 'd',
    clubs: 'c',
    spades: 's',
  };

  return `${card.rank}${suitMap[card.suit]}`;
}

/**
 * Convert unified game state to backend format
 */
export function convertToBackendGameState(unifiedState: UnifiedGameState): any {
  return {
    gameId: unifiedState.gameId,
    players: unifiedState.players.map(unifiedPlayerToBackend),
    communityCards: unifiedState.communityCards,
    pot: unifiedState.pot,
    currentBet: unifiedState.currentBet,
    minRaise: unifiedState.minRaise,
    bigBlind: unifiedState.bigBlind,
    smallBlind: unifiedState.smallBlind,
    currentPlayerIndex: unifiedState.currentPlayerIndex,
    dealerPosition: unifiedState.dealerPosition,
    gamePhase: unifiedState.gamePhase,
    bettingRound: unifiedState.bettingRound,
  };
}

/**
 * Convert backend response to unified format
 */
export function convertFromBackendResponse(backendResponse: any): any {
  if (backendResponse.players) {
    // This is a game state response
    return {
      ...backendResponse,
      players: backendResponse.players.map(backendPlayerToUnified),
    };
  }

  // This might be a legal actions response or other response type
  return backendResponse;
}

/**
 * Convert array of string cards to Card objects
 */
export function stringCardsToCards(cardStrings: string[]): Card[] {
  return cardStrings.map(stringToCard).filter((card): card is Card => card !== null);
}

/**
 * Convert array of Card objects to string cards
 */
export function cardsToStringCards(cards: Card[]): string[] {
  return cards.map(cardToString);
}

/**
 * Validate that a player array is compatible with unified format
 */
export function validatePlayersForUnified(players: any[]): boolean {
  return players.every(
    (player) =>
      typeof player.id === 'string' &&
      typeof player.name === 'string' &&
      typeof player.position === 'string' &&
      typeof player.chips === 'number' &&
      player.chips >= 0,
  );
}

// Export all conversion utilities as a single object
export const conversionUtils: ConversionUtils = {
  frontendPlayerToUnified,
  unifiedPlayerToBackend,
  backendPlayerToUnified,
  stringToCard,
  cardToString,
};
