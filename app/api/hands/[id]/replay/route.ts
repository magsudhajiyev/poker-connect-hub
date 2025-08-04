import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/connectMongoDB';
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const toSequence = searchParams.get('toSequence');

    // Validate hand ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid hand ID' }, 
        { status: 400 },
      );
    }

    const adapter = new EventSourcingAdapter(id);
    
    if (toSequence !== null) {
      // Replay to specific sequence
      const sequenceNum = parseInt(toSequence);
      const state = await adapter.replayToSequence(sequenceNum);
      
      return NextResponse.json({
        success: true,
        data: {
          state,
          sequenceNumber: sequenceNum,
        },
      });
    } else {
      // Get all events for full replay
      const events = await adapter.getEvents();
      const currentState = await adapter.rebuildState();
      
      return NextResponse.json({
        success: true,
        data: {
          events,
          currentState,
          totalEvents: events.length,
        },
      });
    }

  } catch (error) {
    console.error('Replay error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' }, 
      { status: 500 },
    );
  }
}