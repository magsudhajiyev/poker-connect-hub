const http = require('http');

// Test data for the poker API
const testGameState = {
  gameState: {
    gameId: "test-game-123",
    players: [
      {
        id: "player1",
        name: "Alice",
        chips: 1000,
        holeCards: [
          { suit: "hearts", rank: "A" },
          { suit: "spades", rank: "K" }
        ],
        position: 0,
        isActive: true,
        hasActed: false,
        currentBet: 0,
        isFolded: false,
        isAllIn: false
      },
      {
        id: "player2",
        name: "Bob",
        chips: 800,
        holeCards: [
          { suit: "diamonds", rank: "Q" },
          { suit: "clubs", rank: "J" }
        ],
        position: 1,
        isActive: true,
        hasActed: false,
        currentBet: 50,
        isFolded: false,
        isAllIn: false
      }
    ],
    communityCards: [
      { suit: "hearts", rank: "10" },
      { suit: "diamonds", rank: "9" },
      { suit: "spades", rank: "8" }
    ],
    pot: 100,
    currentBet: 50,
    minRaise: 50,
    bigBlind: 50,
    smallBlind: 25,
    currentPlayerIndex: 0,
    dealerPosition: 1,
    gamePhase: "flop",
    bettingRound: 2
  },
  playerId: "player1"
};

function testPokerAPI() {
  const postData = JSON.stringify(testGameState);
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/poker/actions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:');
      try {
        const response = JSON.parse(data);
        console.log(JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}

console.log('Testing Poker API...');
testPokerAPI();
