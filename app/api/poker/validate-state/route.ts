import { NextRequest, NextResponse } from 'next/server';
import { pokerService } from '@/lib/poker/poker-service';
import { GameState, ValidationResult } from '@/lib/poker/interfaces';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameState } = body;

    if (!gameState) {
      return NextResponse.json(
        { error: 'Game state is required' },
        { status: 400 }
      );
    }

    // Validate the game state
    const isValid = pokerService.validateGameState(gameState as GameState);
    
    const result: ValidationResult = {
      isValid,
      message: isValid ? 'Game state is valid' : 'Invalid game state',
      errors: isValid ? undefined : ['Invalid game state structure or data']
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in poker validate-state API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to validate game state',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}