import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { errorResponse, successResponse } from '@/lib/api-utils';
import { ObjectId } from 'mongodb';
import { PostQuery, PostWithUserInfo, CommentDocument, UserDocument } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const userId = searchParams.get('userId'); // Optional filter by user

    // Search parameters
    const searchQuery = searchParams.get('search') || '';
    const dateRange = searchParams.get('dateRange') || 'all';

    if (page < 1 || pageSize < 1 || pageSize > 50) {
      return errorResponse('Invalid pagination parameters', 400);
    }

    const db = await getDatabase();
    const postsCollection = db.collection('posts');

    // Build query
    const query: PostQuery = {};
    if (userId) {
      query.userId = new ObjectId(userId);
    }

    // Add search query
    if (searchQuery) {
      query.$or = [
        { content: { $regex: searchQuery, $options: 'i' } },
        { 'userId.name': { $regex: searchQuery, $options: 'i' } },
      ];
    }

    // Add date range filter
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

      query.createdAt = { $gte: startDate };
    }

    // Build aggregation pipeline
    const matchStage: any = {};
    if (userId) {
      matchStage.userId = new ObjectId(userId);
    }

    // Add date range to match stage
    if (dateRange !== 'all' && query.createdAt) {
      matchStage.createdAt = query.createdAt;
    }

    // Create pipeline with user lookup first for search
    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $addFields: {
          userId: {
            $let: {
              vars: { user: { $arrayElemAt: ['$userInfo', 0] } },
              in: {
                _id: { $toString: '$$user._id' },
                name: '$$user.name',
                picture: '$$user.picture',
                email: '$$user.email',
              },
            },
          },
        },
      },
    ];

    // Add search filter after user info is populated
    if (searchQuery) {
      pipeline.push({
        $match: {
          $or: [
            { content: { $regex: searchQuery, $options: 'i' } },
            { 'userId.name': { $regex: searchQuery, $options: 'i' } },
          ],
        },
      });
    }

    // Get total count with count stage
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await postsCollection.aggregate(countPipeline).toArray();
    const totalCount = countResult[0]?.total || 0;

    // Add sorting and pagination
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
      { $project: { userInfo: 0 } },
    );

    // Get posts with user info
    const posts = await postsCollection.aggregate<PostWithUserInfo>(pipeline).toArray();

    // Populate comments with user info
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        if (post.comments && post.comments.length > 0) {
          const userIds = post.comments.map((c: CommentDocument) => new ObjectId(c.userId));
          const users = await db
            .collection<UserDocument>('users')
            .find({ _id: { $in: userIds } })
            .toArray();

          const userMap = new Map(users.map((u) => [u._id.toString(), u]));

          // Map comments with user information
          const commentsWithUsers = post.comments.map((comment: CommentDocument) => {
            const user = userMap.get(comment.userId.toString());
            return {
              ...comment,
              userId: user
                ? {
                    _id: user._id.toString(),
                    name: user.name,
                    picture: user.picture,
                    email: user.email,
                  }
                : comment.userId,
            };
          });
          // Override with mapped comments
          (post as any).comments = commentsWithUsers;
        }
        return post;
      }),
    );

    return successResponse({
      posts: postsWithComments,
      totalCount,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error listing posts:', error);
    return errorResponse('Failed to list posts', 500);
  }
}
