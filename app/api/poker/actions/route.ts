import { NextRequest, NextResponse } from 'next/server';
import { pokerService } from '@/lib/poker/poker-service';
import { GameState } from '@/lib/poker/interfaces';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameState, playerId } = body;

    if (!gameState) {
      return NextResponse.json(
        { error: 'Game state is required' },
        { status: 400 }
      );
    }

    // Validate the game state
    if (!pokerService.validateGameState(gameState as GameState)) {
      return NextResponse.json(
        { error: 'Invalid game state provided' },
        { status: 400 }
      );
    }

    // Get legal actions for the current player
    const result = pokerService.getLegalActions(gameState as GameState, playerId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in poker actions API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate legal actions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}