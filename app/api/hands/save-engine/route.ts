import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/api-utils';
import { SharedHand } from '@/models/SharedHand';
import { HandEvent } from '@/models/HandEvent';
import { PokerEvent } from '@/poker-engine/core/events';
import connectMongoDB from '@/lib/connectMongoDB';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { title, description, gameConfig, events } = body;


    // Validate required fields
    if (!title || !gameConfig || !events || !Array.isArray(events)) {
      return NextResponse.json(
        {
          error: 'Missing required fields: title, gameConfig, events',
        },
        { status: 400 },
      );
    }
    
    // Ensure we have at least one event
    if (events.length === 0) {
      return NextResponse.json(
        {
          error: 'No events provided. Hand must have at least one event.',
        },
        { status: 400 },
      );
    }

    await connectMongoDB();

    // Create the SharedHand document first
    const sharedHand = new SharedHand({
      userId: user.userId,
      title,
      description: description || '',
      gameType: gameConfig.gameType,
      gameFormat: gameConfig.gameFormat,
      tableSize: 6, // Default table size
      positions: {
        players: [],
      },
      isEventSourced: true,
      lastEventSequence: -1,
      events: [],
    });

    // Save the hand to get an ID
    const savedHand = await sharedHand.save();

    // Now create HandEvent documents for each event
    const handEventIds = [];
    for (let i = 0; i < events.length; i++) {
      const event = events[i] as PokerEvent;
      
      
      // Create HandEvent document
      const handEvent = new HandEvent({
        handId: savedHand._id,
        eventType: event.type,
        eventData: event.data,
        eventVersion: event.version || 1,
        sequenceNumber: i,
        timestamp: event.timestamp || new Date(),
        playerId: event.type === 'ACTION_TAKEN' ? (event.data as any).playerId : undefined,
      });

      const savedEvent = await handEvent.save();
      handEventIds.push(savedEvent._id);
    }

    // Update the SharedHand with event references and last sequence number
    savedHand.events = handEventIds;
    savedHand.lastEventSequence = events.length - 1;
    await savedHand.save();
    
    
    // Ensure all writes are flushed
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      hand: {
        id: savedHand._id,
        title: savedHand.title,
        description: savedHand.description,
        createdAt: savedHand.createdAt,
      },
    });
  } catch (error) {
    console.error('Error saving hand:', error);
    return NextResponse.json(
      {
        error: 'Failed to save hand',
      },
      { status: 500 },
    );
  }
}
