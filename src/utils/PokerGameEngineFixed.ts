import { PokerPlayer, PokerAction, SidePot } from '@/types/poker';

/**
 * Fixed PokerGameEngine with proper minimum raise tracking and side pot calculations
 */
export class PokerGameEngineFixed {
  players: PokerPlayer[];
  smallBlind: number;
  bigBlind: number;
  pot: number;
  communityCards: string[];
  street: 'preflop' | 'flop' | 'turn' | 'river';
  actions: PokerAction[];
  currentBet: number;
  currentPlayerIndex: number | null;
  lastRaiseSize: number; // Track the size of the last raise
  sidePots: SidePot[]; // Track side pots for all-in situations
  minRaise: number; // Minimum raise amount

  constructor(players: PokerPlayer[], smallBlind: number, bigBlind: number) {
    // Validate input parameters
    if (!players || players.length < 2) {
      throw new Error('At least 2 players are required to start a poker game');
    }

    if (players.length > 10) {
      throw new Error('Maximum of 10 players allowed in a poker game');
    }

    if (!smallBlind || smallBlind <= 0) {
      throw new Error('Small blind must be a positive number');
    }

    if (!bigBlind || bigBlind <= 0) {
      throw new Error('Big blind must be a positive number');
    }

    if (bigBlind < smallBlind * 2) {
      throw new Error('Big blind must be at least twice the small blind');
    }

    this.players = players.map((p) => ({
      ...p,
      betAmount: 0,
      hasFolded: false,
      isAllIn: false,
      lastAction: undefined,
    }));

    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    this.pot = 0;
    this.communityCards = [];
    this.street = 'preflop';
    this.actions = [];
    this.currentBet = 0;
    this.currentPlayerIndex = null;
    this.lastRaiseSize = bigBlind; // Initial raise size is the big blind
    this.minRaise = bigBlind; // Minimum raise is initially the big blind
    this.sidePots = [];

    // Post blinds automatically
    this.postBlinds();
  }

  private postBlinds(): void {
    // Find SB and BB positions
    const sbPlayer = this.players.find((p) => p.position === 'SB');
    const bbPlayer = this.players.find((p) => p.position === 'BB');

    if (!sbPlayer || !bbPlayer) {
      throw new Error('Small blind and big blind positions must be defined');
    }

    // Post small blind
    const sbAmount = Math.min(this.smallBlind, sbPlayer.stack);
    sbPlayer.stack -= sbAmount;
    sbPlayer.betAmount = sbAmount;
    this.pot += sbAmount;

    if (sbPlayer.stack === 0) {
      sbPlayer.isAllIn = true;
    }

    // Post big blind
    const bbAmount = Math.min(this.bigBlind, bbPlayer.stack);
    bbPlayer.stack -= bbAmount;
    bbPlayer.betAmount = bbAmount;
    this.pot += bbAmount;
    this.currentBet = bbAmount;

    if (bbPlayer.stack === 0) {
      bbPlayer.isAllIn = true;
    }

    // Set first player to act (UTG or BTN in heads-up)
    this.setFirstPlayerToAct();
  }

  private setFirstPlayerToAct(): void {
    const activePlayers = this.players.filter((p) => !p.hasFolded && p.stack > 0);

    if (this.street === 'preflop') {
      if (activePlayers.length === 2) {
        // Heads-up: SB/BTN acts first preflop
        const sbIndex = this.players.findIndex((p) => p.position === 'SB');
        this.currentPlayerIndex = sbIndex >= 0 ? sbIndex : 0;
      } else {
        // Find first active player after BB (UTG position)
        const bbIndex = this.players.findIndex((p) => p.position === 'BB');
        let nextIndex = (bbIndex + 1) % this.players.length;

        while (this.players[nextIndex].hasFolded || this.players[nextIndex].isAllIn) {
          nextIndex = (nextIndex + 1) % this.players.length;
          if (nextIndex === bbIndex) {
            break;
          } // Avoid infinite loop
        }

        this.currentPlayerIndex = nextIndex;
      }
    } else {
      // Post-flop: SB acts first
      const sbIndex = this.players.findIndex(
        (p) => p.position === 'SB' && !p.hasFolded && p.stack > 0,
      );
      if (sbIndex >= 0) {
        this.currentPlayerIndex = sbIndex;
      } else {
        // If SB folded, find next active player
        const positions = ['BB', 'UTG', 'UTG+1', 'MP', 'MP+1', 'CO', 'BTN'];
        for (const pos of positions) {
          const idx = this.players.findIndex(
            (p) => p.position === pos && !p.hasFolded && p.stack > 0,
          );
          if (idx >= 0) {
            this.currentPlayerIndex = idx;
            break;
          }
        }
      }
    }
  }

  processAction(player: PokerPlayer, action: PokerAction): void {
    // Validate player
    const playerIndex = this.players.findIndex((p) => p.id === player.id);
    if (playerIndex === -1) {
      throw new Error('Player not found in game');
    }

    // Validate it's player's turn
    if (this.currentPlayerIndex !== playerIndex) {
      throw new Error("Not player's turn to act");
    }

    const gamePlayer = this.players[playerIndex];

    // Validate player can act
    if (gamePlayer.hasFolded || gamePlayer.isAllIn) {
      throw new Error('Player cannot act (folded or all-in)');
    }

    switch (action.type) {
      case 'fold':
        this.handleFold(gamePlayer);
        break;

      case 'check':
        this.handleCheck(gamePlayer);
        break;

      case 'call':
        this.handleCall(gamePlayer);
        break;

      case 'raise':
        if (action.amount === undefined) {
          throw new Error('Raise amount must be specified');
        }
        this.handleRaise(gamePlayer, action.amount);
        break;

      case 'allin':
        this.handleAllIn(gamePlayer);
        break;

      default:
        throw new Error(`Invalid action type: ${action.type}`);
    }

    // Record action
    this.actions.push({
      ...action,
      playerId: player.id,
      street: this.street,
      timestamp: new Date().toISOString(),
    });

    // Update player's last action
    gamePlayer.lastAction = action.type;

    // Move to next player
    this.moveToNextPlayer();
  }

  private handleFold(player: PokerPlayer): void {
    player.hasFolded = true;
  }

  private handleCheck(player: PokerPlayer): void {
    if (player.betAmount < this.currentBet) {
      throw new Error('Cannot check - must call, raise, or fold');
    }
  }

  private handleCall(player: PokerPlayer): void {
    const toCall = this.currentBet - player.betAmount;
    if (toCall <= 0) {
      throw new Error('Nothing to call');
    }

    const callAmount = Math.min(toCall, player.stack);
    player.stack -= callAmount;
    player.betAmount += callAmount;
    this.pot += callAmount;

    if (player.stack === 0) {
      player.isAllIn = true;
    }
  }

  private handleRaise(player: PokerPlayer, raiseToAmount: number): void {
    const toCall = this.currentBet - player.betAmount;
    const raiseAmount = raiseToAmount - this.currentBet;

    // Validate minimum raise
    if (raiseAmount < this.lastRaiseSize) {
      throw new Error(
        `Minimum raise is ${this.currentBet + this.lastRaiseSize}. ` +
          `Current bet: ${this.currentBet}, Last raise: ${this.lastRaiseSize}`,
      );
    }

    const totalRequired = toCall + raiseAmount;
    if (totalRequired > player.stack) {
      throw new Error(
        `Insufficient stack for raise. Required: ${totalRequired}, Available: ${player.stack}`,
      );
    }

    // Update game state
    player.stack -= totalRequired;
    player.betAmount += totalRequired;
    this.pot += totalRequired;

    // Update raise tracking
    this.lastRaiseSize = raiseAmount;
    this.currentBet = raiseToAmount;

    if (player.stack === 0) {
      player.isAllIn = true;
    }
  }

  private handleAllIn(player: PokerPlayer): void {
    const allInAmount = player.stack;
    if (allInAmount === 0) {
      throw new Error('Player has no chips to go all-in');
    }

    player.stack = 0;
    player.betAmount += allInAmount;
    this.pot += allInAmount;
    player.isAllIn = true;

    // Update current bet if this all-in is larger
    if (player.betAmount > this.currentBet) {
      this.lastRaiseSize = player.betAmount - this.currentBet;
      this.currentBet = player.betAmount;
    }
  }

  private moveToNextPlayer(): void {
    const activePlayers = this.players.filter((p) => !p.hasFolded && !p.isAllIn && p.stack > 0);

    if (activePlayers.length <= 1) {
      // Betting round is over
      this.currentPlayerIndex = null;
      return;
    }

    // Find next active player
    let nextIndex = (this.currentPlayerIndex! + 1) % this.players.length;
    while (
      this.players[nextIndex].hasFolded ||
      this.players[nextIndex].isAllIn ||
      this.players[nextIndex].stack === 0
    ) {
      nextIndex = (nextIndex + 1) % this.players.length;
    }

    // Check if betting round is complete
    const allPlayersActed = this.checkBettingRoundComplete();
    if (allPlayersActed) {
      this.currentPlayerIndex = null;
    } else {
      this.currentPlayerIndex = nextIndex;
    }
  }

  private checkBettingRoundComplete(): boolean {
    const activePlayers = this.players.filter((p) => !p.hasFolded && !p.isAllIn && p.stack > 0);

    // All active players must have bet the same amount
    return activePlayers.every((p) => p.betAmount === this.currentBet);
  }

  calculateSidePots(): void {
    this.sidePots = [];

    // Get all players who have bet money (including folded players)
    const playersWithBets = this.players
      .filter((p) => p.betAmount > 0)
      .sort((a, b) => a.betAmount - b.betAmount);

    if (playersWithBets.length === 0) {
      return;
    }

    let remainingPlayers = [...playersWithBets];
    let lastBetAmount = 0;

    while (remainingPlayers.length > 0) {
      const currentBetLevel = remainingPlayers[0].betAmount;
      const betIncrement = currentBetLevel - lastBetAmount;

      if (betIncrement > 0) {
        // Calculate pot for this level
        const potAmount = betIncrement * remainingPlayers.length;

        // Eligible players are those who haven't folded
        const eligiblePlayers = remainingPlayers.filter((p) => !p.hasFolded).map((p) => p.id);

        if (eligiblePlayers.length > 0) {
          this.sidePots.push({
            amount: potAmount,
            eligiblePlayers,
          });
        }
      }

      // Remove players who have no more money to contribute
      remainingPlayers = remainingPlayers.filter((p) => p.betAmount > currentBetLevel);
      lastBetAmount = currentBetLevel;
    }
  }

  advanceToFlop(flopCards: string[]): void {
    if (flopCards.length !== 3) {
      throw new Error('Flop must contain exactly 3 cards');
    }

    this.street = 'flop';
    this.communityCards = [...flopCards];
    this.resetBettingRound();
  }

  advanceToTurn(turnCard: string): void {
    if (this.street !== 'flop') {
      throw new Error('Can only advance to turn from flop');
    }

    this.street = 'turn';
    this.communityCards.push(turnCard);
    this.resetBettingRound();
  }

  advanceToRiver(riverCard: string): void {
    if (this.street !== 'turn') {
      throw new Error('Can only advance to river from turn');
    }

    this.street = 'river';
    this.communityCards.push(riverCard);
    this.resetBettingRound();
  }

  private resetBettingRound(): void {
    // Reset bet amounts for new street
    this.players.forEach((p) => {
      p.betAmount = 0;
    });

    this.currentBet = 0;
    this.lastRaiseSize = this.bigBlind; // Reset to big blind for new street

    // Set first player to act (SB or first active player after SB)
    const activePlayers = this.players.filter((p) => !p.hasFolded && !p.isAllIn && p.stack > 0);

    if (activePlayers.length > 1) {
      // Find first active player from SB position
      const positions = ['SB', 'BB', 'UTG', 'UTG+1', 'MP', 'MP+1', 'CO', 'BTN'];

      for (const pos of positions) {
        const playerIndex = this.players.findIndex(
          (p) => p.position === pos && !p.hasFolded && !p.isAllIn && p.stack > 0,
        );

        if (playerIndex !== -1) {
          this.currentPlayerIndex = playerIndex;
          break;
        }
      }
    }
  }

  getGameState() {
    return {
      players: this.players,
      pot: this.pot,
      communityCards: this.communityCards,
      street: this.street,
      currentBet: this.currentBet,
      currentPlayerIndex: this.currentPlayerIndex,
      lastRaiseSize: this.lastRaiseSize,
      sidePots: this.sidePots,
    };
  }
}
