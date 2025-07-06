import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { SharedHand } from '@/models/SharedHand';
import User from '@/models/User';

// GET /api/hands/list - List all public hands
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Ensure User model is registered
    // eslint-disable-next-line no-unused-expressions, @typescript-eslint/no-unused-expressions
    User;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const userId = searchParams.get('userId');
    const tags = searchParams.getAll('tags');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { isPublic: true };

    if (userId) {
      filter.userId = userId;
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [hands, total] = await Promise.all([
      SharedHand.find(filter)
        .populate('userId', 'name email image')
        .populate('comments.userId', 'name email picture')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SharedHand.countDocuments(filter),
    ]);

    // Add computed fields
    const handsWithCounts = hands.map((hand: any) => ({
      ...hand,
      likeCount: hand.likes?.length || 0,
      commentCount: hand.comments?.length || 0,
    }));

    return NextResponse.json({
      success: true,
      data: { hands: handsWithCounts, total, page, limit },
    });
  } catch (error) {
    console.error('Error fetching hands:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to fetch hands' } },
      { status: 500 },
    );
  }
}
