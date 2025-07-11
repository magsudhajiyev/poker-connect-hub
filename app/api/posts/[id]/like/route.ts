import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser, errorResponse, successResponse } from '@/lib/api-utils';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const userId = currentUser.userId;
    const likes = post.likes || [];
    const isLiked = likes.includes(userId);

    // Toggle like
    let updateResult;
    if (isLiked) {
      // Unlike
      // TODO: Replace any with proper MongoDB type when available
      updateResult = await postsCollection.updateOne(
        { _id: new ObjectId(postId) },
        {
          $pull: { likes: userId as any },
          $inc: { likeCount: -1 },
          $set: { updatedAt: new Date() },
        },
      );
    } else {
      // Like
      // TODO: Replace any with proper MongoDB type when available
      updateResult = await postsCollection.updateOne(
        { _id: new ObjectId(postId) },
        {
          $addToSet: { likes: userId as any },
          $inc: { likeCount: 1 },
          $set: { updatedAt: new Date() },
        },
      );
    }

    if (!updateResult.acknowledged) {
      return errorResponse('Failed to update like', 500);
    }

    // Get updated like count
    const updatedPost = await postsCollection.findOne({ _id: new ObjectId(postId) });

    return successResponse({
      liked: !isLiked,
      likeCount: updatedPost?.likeCount || 0,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return errorResponse('Failed to toggle like', 500);
  }
}
