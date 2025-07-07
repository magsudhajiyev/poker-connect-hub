import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { getDatabase } from '@/lib/mongodb';
import { OnboardingAnswer } from '@/models/user.model';

// GET /api/users/search - Search users by name and username
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    // Validate query
    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        data: { users: [] },
        message: 'Query must be at least 2 characters',
      });
    }

    // Limit query length for performance
    if (query.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: { message: 'Query too long' },
        },
        { status: 400 },
      );
    }

    await dbConnect();

    // Create case-insensitive regex for partial matching
    const searchRegex = new RegExp(query, 'i');

    // Search users by name in User collection
    const usersByName = await User.find({
      name: { $regex: searchRegex },
      isActive: true,
    })
      .select('_id name email image')
      .limit(15)
      .lean();

    // Search by username in OnboardingAnswer collection
    const db = await getDatabase();
    const onboardingCollection = db.collection<OnboardingAnswer>('onboardinganswers');

    const usernameMatches = await onboardingCollection
      .find({
        username: { $regex: searchRegex },
      })
      .limit(15)
      .toArray();

    // Get user details for username matches
    const userIds = usernameMatches.map((match) => match.userId);
    const usersByUsername = await User.find({
      _id: { $in: userIds },
      isActive: true,
    })
      .select('_id name email image')
      .limit(15)
      .lean();

    // Create a map of userId to username for quick lookup
    const usernameMap = new Map(usernameMatches.map((match) => [match.userId, match.username]));

    // Combine and deduplicate results
    const allUsers = new Map();

    // Add users found by name
    usersByName.forEach((user) => {
      const userId = user._id.toString();
      allUsers.set(userId, {
        id: userId,
        name: user.name,
        email: user.email,
        picture: user.image || '',
        username: usernameMap.get(userId) || `@${user.email.split('@')[0]}`,
        matchType: 'name',
      });
    });

    // Add users found by username (will overwrite if duplicate, keeping username match priority)
    usersByUsername.forEach((user) => {
      const userId = user._id.toString();
      allUsers.set(userId, {
        id: userId,
        name: user.name,
        email: user.email,
        picture: user.image || '',
        username: usernameMap.get(userId) || `@${user.email.split('@')[0]}`,
        matchType: allUsers.has(userId) ? 'both' : 'username',
      });
    });

    // Convert to array and limit results
    const results = Array.from(allUsers.values()).slice(0, 10);

    // Sort by match relevance (exact matches first, then by name)
    results.sort((a, b) => {
      // Prioritize exact matches
      const aExact =
        a.name.toLowerCase() === query.toLowerCase() ||
        a.username.toLowerCase() === `@${query.toLowerCase()}`;
      const bExact =
        b.name.toLowerCase() === query.toLowerCase() ||
        b.username.toLowerCase() === `@${query.toLowerCase()}`;

      if (aExact && !bExact) {
        return -1;
      }
      if (!aExact && bExact) {
        return 1;
      }

      // Then by match type (both > username > name)
      const typeOrder = { both: 0, username: 1, name: 2 };
      const aOrder = typeOrder[a.matchType as keyof typeof typeOrder];
      const bOrder = typeOrder[b.matchType as keyof typeof typeOrder];

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      // Finally by name alphabetically
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      success: true,
      data: {
        users: results,
        query,
        count: results.length,
      },
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to search users' } },
      { status: 500 },
    );
  }
}
