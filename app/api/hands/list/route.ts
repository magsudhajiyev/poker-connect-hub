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

    // Additional filters
    const dateRange = searchParams.get('dateRange') || 'all';
    const gameTypes = searchParams.getAll('gameType');
    const positions = searchParams.getAll('positions');
    const stakes = searchParams.getAll('stakes');

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

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(0);
      }

      filter.createdAt = { $gte: startDate };
    }

    // Game type filter
    if (gameTypes && gameTypes.length > 0) {
      filter.gameType = { $in: gameTypes };
    }

    // Positions filter - check if hero was in any of these positions
    if (positions && positions.length > 0) {
      filter['positions.heroPosition'] = { $in: positions };
    }

    // Stakes filter - this would need to be implemented based on your stakes structure
    if (stakes && stakes.length > 0) {
      // You'll need to implement stakes mapping based on your data structure
      // For now, we'll add a comment placeholder
      // filter['stakes'] = { $in: stakes };
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
      likeCount: (hand as any).likes?.length || 0,
      commentCount: (hand as any).comments?.length || 0,
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
