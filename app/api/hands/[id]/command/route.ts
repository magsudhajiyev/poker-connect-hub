import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/connectMongoDB';
import { SharedHand } from '@/models/SharedHand';
import { EventSourcingAdapter } from '@/poker-engine/adapters/EventSourcingAdapter';
import { ActionType } from '@/types/poker';
import { getCurrentUser } from '@/lib/api-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Authenticate
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' }, 
        { status: 401 },
      );
    }

    await connectMongoDB();

    // Await params as required in Next.js 15
    const { id } = await params;

    // Parse request
    const body = await request.json();
    const { action, amount, playerId } = body;
    

    // Validate input
    if (!action || !playerId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' }, 
        { status: 400 },
      );
    }

    // Load hand
    const hand = await SharedHand.findById(id);
    if (!hand) {
      return NextResponse.json(
        { success: false, error: 'Hand not found' }, 
        { status: 404 },
      );
    }

    // Check permissions (user must be creator or participant)
    const userId = currentUser.userId;
    const userCanEdit = hand.userId.toString() === userId ||
                       hand.positions?.players?.some((p: any) => p.userId === userId);
    
    if (!userCanEdit) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' }, 
        { status: 403 },
      );
    }

    // Process command through event sourcing
    const adapter = new EventSourcingAdapter(id);
    const result = await adapter.processCommand(
      playerId,
      action as ActionType,
      amount,
    );

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error,
          validActions: result.validActions, 
        }, 
        { status: 400 },
      );
    }

    // Return success with new valid actions
    return NextResponse.json({
      success: true,
      event: {
        id: result.event!._id,
        type: result.event!.eventType,
        sequenceNumber: result.event!.sequenceNumber,
      },
      validActions: result.validActions,
      message: 'Action processed successfully',
    });

  } catch (error) {
    console.error('Command processing error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        } : undefined,
      }, 
      { status: 500 },
    );
  }
}