import { NextRequest, NextResponse } from 'next/server';
import { pokerService } from '@/lib/poker/poker-service';
import { GameState } from '@/lib/poker/interfaces';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameState } = body;

    if (!gameState) {
      return NextResponse.json({ error: 'Game state is required' }, { status: 400 });
    }

    // Validate the game state
    if (!pokerService.validateGameState(gameState as GameState)) {
      return NextResponse.json({ error: 'Invalid game state provided' }, { status: 400 });
    }

    // For now, return the same game state
    // In the future, this will integrate with OpenAI for AI-driven game progression
    const nextGameState = gameState as GameState;

    // TODO: Implement AI logic to calculate next game state
    // This would involve:
    // 1. Getting legal actions for current player
    // 2. Using AI to select an action
    // 3. Applying that action to create new game state

    return NextResponse.json(nextGameState);
  } catch (error) {
    console.error('Error in poker next-state API:', error);
    return NextResponse.json(
      {
        error: 'Failed to get next game state',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
