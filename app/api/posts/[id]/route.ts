import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser, errorResponse, successResponse } from '@/lib/api-utils';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get current user from JWT
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return errorResponse('Unauthorized', 401);
    }

    const { id: postId } = await params;
    if (!ObjectId.isValid(postId)) {
      return errorResponse('Invalid post ID', 400);
    }

    const db = await getDatabase();
    const postsCollection = db.collection('posts');

    // Get the post
    const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Check if user owns the post
    if (post.userId.toString() !== currentUser.userId) {
      return errorResponse('You can only delete your own posts', 403);
    }

    // Delete the post
    const deleteResult = await postsCollection.deleteOne({ _id: new ObjectId(postId) });

    if (!deleteResult.acknowledged) {
      return errorResponse('Failed to delete post', 500);
    }

    return successResponse({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return errorResponse('Failed to delete post', 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Get current user from JWT
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return errorResponse('Unauthorized', 401);
    }

    const { id: postId } = await params;
    if (!ObjectId.isValid(postId)) {
      return errorResponse('Invalid post ID', 400);
    }

    // Parse request body
    const body = await request.json();
    const { content } = body;

    // Validate content
    if (!content || content.trim().length === 0) {
      return errorResponse('Post content is required', 400);
    }

    if (content.length > 500) {
      return errorResponse('Post content must be 500 characters or less', 400);
    }

    const db = await getDatabase();
    const postsCollection = db.collection('posts');

    // Get the post
    const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Check if user owns the post
    if (post.userId.toString() !== currentUser.userId) {
      return errorResponse('You can only edit your own posts', 403);
    }

    // Update the post
    const updateResult = await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      {
        $set: {
          content: content.trim(),
          updatedAt: new Date(),
        },
      },
    );

    if (!updateResult.acknowledged) {
      return errorResponse('Failed to update post', 500);
    }

    // Return the updated post with user info
    const updatedPost = await postsCollection
      .aggregate([
        { $match: { _id: new ObjectId(postId) } },
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

    if (updatedPost.length === 0) {
      return errorResponse('Failed to fetch updated post', 500);
    }

    return successResponse(updatedPost[0]);
  } catch (error) {
    console.error('Error updating post:', error);
    return errorResponse('Failed to update post', 500);
  }
}
