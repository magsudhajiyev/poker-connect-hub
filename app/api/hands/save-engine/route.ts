import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/api-utils';
import { HandRepository } from '@/poker-engine/repository/hand-repository';
import { CreateHandDTO } from '@/types/poker-engine';

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

    // Create hand data
    const createHandData: CreateHandDTO = {
      userId: user.userId,
      title,
      description: description || '',
      gameConfig,
      events,
    };

    // Save hand using repository
    const repository = new HandRepository();
    const savedHand = await repository.createHand(createHandData);

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
