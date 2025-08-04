import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/connectMongoDB';
import { EventSourcingAdapter } from '@/poker-engine/adapters/EventSourcingAdapter';
import mongoose from 'mongoose';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectMongoDB();

    // Await params as required in Next.js 15
    const { id } = await params;

    // Validate hand ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid hand ID' }, 
        { status: 400 },
      );
    }

    const adapter = new EventSourcingAdapter(id);
    
    try {
      const validActions = await adapter.getValidActions();
      const state = await adapter.rebuildState();

      const currentPlayerId = state?.currentState?.betting?.actionOn;
      const currentPlayer = currentPlayerId && state?.currentState?.players ? 
        state.currentState.players.get(currentPlayerId) : null;

      return NextResponse.json({
        success: true,
        data: {
          validActions,
          currentPlayer,
          currentPlayerId,
          currentBet: state?.currentState?.betting?.currentBet || 0,
          pot: state?.currentState?.betting?.pot || 0,
          street: state?.currentState?.street || 'preflop',
        },
      });
    } catch (stateError: any) {
      // If we can't rebuild state (e.g., no initialization event), return empty state
      if (stateError.message?.includes('No initialization event')) {
        return NextResponse.json({
          success: true,
          data: {
            validActions: [],
            currentPlayer: null,
            currentPlayerId: null,
            currentBet: 0,
            pot: 0,
            street: 'preflop',
          },
        });
      }
      throw stateError;
    }

  } catch (error) {
    console.error('Valid actions fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' }, 
      { status: 500 },
    );
  }
}