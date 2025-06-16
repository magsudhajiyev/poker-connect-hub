# Poker Connect Hub Backend

A NestJS backend service for the poker-connect-hub project, featuring OpenAI-powered poker game state management.

## Features

- **Poker Game Logic**: Calculate legal actions for players in any game state
- **OpenAI Integration**: Use GPT-4 as a poker engine for game state progression
- **RESTful API**: Clean endpoints for poker game management
- **TypeScript**: Full type safety with comprehensive interfaces
- **Validation**: Input validation using class-validator

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your OpenAI API key to the `.env` file:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Build
npm run build
```

The server will start on `http://localhost:3001` by default.

## API Endpoints

### GET Legal Actions
**POST** `/api/poker/actions`

Calculate legal actions for a player in a given game state.

**Request Body:**
```json
{
  "gameState": {
    "gameId": "string",
    "players": [...],
    "communityCards": [...],
    "pot": 100,
    "currentBet": 50,
    "minRaise": 50,
    "bigBlind": 50,
    "smallBlind": 25,
    "currentPlayerIndex": 0,
    "dealerPosition": 1,
    "gamePhase": "flop",
    "bettingRound": 2
  },
  "playerId": "player1" // optional
}
```

### GET Next Game State (OpenAI)
**POST** `/api/poker/next-state`

Use OpenAI GPT-4 to determine the next game state based on poker rules.

**Request Body:**
```json
{
  "gameState": {
    "gameId": "string",
    "players": [...],
    "communityCards": [...],
    "pot": 100,
    "currentBet": 50,
    "minRaise": 50,
    "bigBlind": 50,
    "smallBlind": 25,
    "currentPlayerIndex": 0,
    "dealerPosition": 1,
    "gamePhase": "flop",
    "bettingRound": 2
  }
}
```

## Testing

Run the test suite:
```bash
npm run test
```

Test the API endpoints:
```bash
node test-api.js
```

## OpenAI Service

The OpenAI service (`src/poker/services/openai.service.ts`) provides:

- **Game State Validation**: Ensures all game states follow poker rules
- **GPT-4 Integration**: Uses OpenAI's GPT-4 model as a poker engine
- **Error Handling**: Comprehensive error handling and logging
- **JSON Parsing**: Robust parsing of OpenAI responses

### Configuration

The service requires the `OPENAI_API_KEY` environment variable. If not set, the service will log a warning and throw errors when attempting to process game states.

## Architecture

The backend follows the controller-service-repository pattern:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **DTOs**: Data transfer objects for validation
- **Interfaces**: Type definitions for game entities

## Game State Structure

The core `GameState` interface includes:

- **Game Information**: ID, phase, betting round
- **Players**: Array of player objects with chips, cards, status
- **Community Cards**: Shared cards on the board
- **Betting Information**: Current bet, pot size, blinds
- **Turn Management**: Current player index, dealer position
