import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/connectMongoDB';
import { HandEvent } from '@/models/HandEvent';
import { EventSourcingAdapter } from '@/poker-engine/adapters/EventSourcingAdapter';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectMongoDB();

    // Await params as required in Next.js 15
    const { id } = await params;

    // Get query params for pagination
    const { searchParams } = new URL(request.url);
    const fromSequence = parseInt(searchParams.get('fromSequence') || '0');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Validate hand ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid hand ID' }, 
        { status: 400 },
      );
    }

    // Load events
    const handObjectId = new mongoose.Types.ObjectId(id);
    
    const events = await HandEvent
      .find({ 
        handId: handObjectId,
        sequenceNumber: { $gte: fromSequence },
      })
      .sort({ sequenceNumber: 1 })
      .limit(limit)
      .lean();
    
    
    // Debug: Check if there are any events at all for this hand
    if (events.length === 0) {
      await HandEvent.countDocuments({ handId: handObjectId });
      
      // Check if the hand exists
      await mongoose.model('SharedHand').exists({ _id: handObjectId });
    }

    // Try to rebuild current state from events
    const adapter = new EventSourcingAdapter(id);
    
    let currentState = null;
    try {
      const state = await adapter.rebuildState();
      currentState = state.currentState;
      
      // Convert Map to plain object for JSON serialization
      if (currentState.players instanceof Map) {
        const playersObj: any = {};
        currentState.players.forEach((player, id) => {
          playersObj[id] = player;
        });
        currentState = {
          ...currentState,
          players: playersObj,
        };
      }
      
    } catch (error: any) {
      // If we can't rebuild state (e.g., no initialization event), return empty state
      if (error.message?.includes('No initialization event')) {
        currentState = {
          street: 'preflop',
          betting: { pot: 0, currentBet: 0, actionOn: null },
          players: {},
          isComplete: false,
        };
      } else {
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      events,
      currentState,
      lastSequence: events.length > 0 ? events[events.length - 1].sequenceNumber : -1,
    });

  } catch (error) {
    console.error('Events fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' }, 
      { status: 500 },
    );
  }
}