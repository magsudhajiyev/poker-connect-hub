
// Pure Poker Game Engine (Editor Mode for Hand Sharing)
// Assumes hand is already played — no shuffling, no dealing, no button movement

export class PokerGameEngine {
  players: any[];
  smallBlind: number;
  bigBlind: number;
  pot: number;
  communityCards: string[];
  street: string;
  actions: any[];
  currentBet: number;
  currentPlayerIndex: number | null;

  constructor(players: any[], smallBlind: number, bigBlind: number) {
    this.players = players.map((p, i) => ({
      id: p.id || i,
      name: p.name || `Player ${i + 1}`,
      stack: p.stack || p.stackSize?.[0] || 100,
      hand: p.hand || [],
      bet: 0,
      folded: false,
      allIn: false,
      position: p.position,
    }));

    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    this.pot = 0;
    this.communityCards = [];
    this.street = 'preflop';
    this.actions = [];
    this.currentBet = 0;
    this.currentPlayerIndex = null;
  }

  // Manual community card setting (for UI-driven input)
  setCommunityCards(cards: string[]) {
    this.communityCards = [...cards];
  }

  // Manual blind posting from UI (no assumptions)
  postBlinds(sbIndex: number, bbIndex: number) {
    const sb = this.players[sbIndex];
    const bb = this.players[bbIndex];

    sb.bet = Math.min(this.smallBlind, sb.stack);
    sb.stack -= sb.bet;
    if (sb.stack === 0) sb.allIn = true;

    bb.bet = Math.min(this.bigBlind, bb.stack);
    bb.stack -= bb.bet;
    if (bb.stack === 0) bb.allIn = true;

    this.pot += sb.bet + bb.bet;
    this.currentBet = bb.bet;
  }

  startBettingRound(startIndex: number) {
    const active = this.players.filter(p => !p.folded && !p.allIn);
    if (active.length <= 1) {
      this.street = 'complete';
      return;
    }
    
    // For preflop, action starts with UTG (first player after BB)
    if (this.street === 'preflop') {
      const bbIndex = this.players.findIndex(p => p.position === 'bb');
      if (bbIndex !== -1) {
        // Start with the player after BB (wrapping around if needed)
        let nextIndex = (bbIndex + 1) % this.players.length;
        // Find the first active player starting from after BB
        for (let i = 0; i < this.players.length; i++) {
          const playerIndex = (bbIndex + 1 + i) % this.players.length;
          const player = this.players[playerIndex];
          if (!player.folded && !player.allIn) {
            this.currentPlayerIndex = playerIndex;
            console.log(`First to act preflop: ${player.name} (${player.position}) at index ${playerIndex}`);
            return;
          }
        }
      }
    }
    
    this.currentPlayerIndex = startIndex;
  }

  getCurrentPlayer() {
    if (this.currentPlayerIndex === null) return null;
    return this.players[this.currentPlayerIndex];
  }

  getLegalActions(): string[] {
    const player = this.getCurrentPlayer();
    if (!player || player.folded || player.allIn) return [];

    const toCall = this.currentBet - player.bet;
    const canRaise = player.stack > toCall;
    const actions: string[] = [];

    if (toCall === 0) {
      actions.push('check');
    } else if (player.stack > 0) {
      actions.push('fold');
      if (player.stack >= toCall) {
        actions.push('call');
      }
    }

    if (canRaise && player.stack > toCall) {
      actions.push('raise');
    }

    if (player.stack > 0) {
      actions.push('all-in');
    }

    console.log(`Legal actions for ${player.name}: ${actions.join(', ')} (toCall: ${toCall}, stack: ${player.stack}, currentBet: ${this.currentBet})`);
    return [...new Set(actions)];
  }

  takeAction(action: string, amount: number = 0): boolean {
    const player = this.getCurrentPlayer();
    if (!player || player.folded || player.allIn) return false;

    const toCall = this.currentBet - player.bet;
    let move = { id: player.id, action, amount, street: this.street };

    console.log(`${player.name} attempting ${action} (amount: ${amount}, toCall: ${toCall})`);

    switch (action) {
      case 'fold':
        player.folded = true;
        break;
      case 'check':
        if (toCall > 0) return false;
        break;
      case 'call':
        const callAmt = Math.min(toCall, player.stack);
        player.stack -= callAmt;
        player.bet += callAmt;
        this.pot += callAmt;
        if (player.stack === 0) player.allIn = true;
        move.amount = callAmt;
        break;
      case 'raise':
        if (player.stack <= toCall + amount) return false;
        player.stack -= (toCall + amount);
        player.bet += (toCall + amount);
        this.currentBet = player.bet;
        this.pot += (toCall + amount);
        if (player.stack === 0) player.allIn = true;
        move.amount = toCall + amount;
        break;
      case 'all-in':
        const allInAmt = player.stack;
        player.stack = 0;
        player.bet += allInAmt;
        this.pot += allInAmt;
        if (player.bet > this.currentBet) this.currentBet = player.bet;
        player.allIn = true;
        move.amount = allInAmt;
        break;
    }

    this.actions.push(move);
    this.advanceToNextPlayer();
    return true;
  }

  advanceToNextPlayer() {
    for (let i = 1; i < this.players.length; i++) {
      const next = (this.currentPlayerIndex! + i) % this.players.length;
      const p = this.players[next];
      if (!p.folded && !p.allIn) {
        this.currentPlayerIndex = next;
        console.log(`Next to act: ${p.name} (${p.position})`);
        return;
      }
    }
    this.currentPlayerIndex = null;
    console.log('No more players to act');
  }

  getState() {
    return {
      players: this.players,
      pot: this.pot,
      street: this.street,
      communityCards: this.communityCards,
      actions: this.actions,
      currentPlayer: this.getCurrentPlayer(),
      currentBet: this.currentBet
    };
  }
}

export default PokerGameEngine;
