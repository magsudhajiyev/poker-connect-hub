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

    // Get total count
    const totalCount = await postsCollection.countDocuments(query);

    // Get posts with user info
    const posts = await postsCollection
      .aggregate<PostWithUserInfo>([
        { $match: query },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * pageSize },
        { $limit: pageSize },
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
        {
          $project: {
            userInfo: 0,
          },
        },
      ])
      .toArray();

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
