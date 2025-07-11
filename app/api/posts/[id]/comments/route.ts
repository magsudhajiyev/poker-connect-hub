import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser, errorResponse, successResponse } from '@/lib/api-utils';
import { ObjectId } from 'mongodb';
import { CommentDocument } from '@/types/database';

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

    // Parse request body
    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return errorResponse('Comment content is required', 400);
    }

    if (content.length > 300) {
      return errorResponse('Comment must be 300 characters or less', 400);
    }

    const db = await getDatabase();
    const postsCollection = db.collection('posts');
    const usersCollection = db.collection('users');

    // Get the post
    const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Get user info
    const user = await usersCollection.findOne({ _id: new ObjectId(currentUser.userId) });
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Create new comment
    const newComment: CommentDocument = {
      _id: new ObjectId(),
      userId: new ObjectId(currentUser.userId),
      content: content.trim() as string,
      createdAt: new Date(),
    };

    // Add comment to post
    // TODO: Replace any with proper MongoDB type when available
    const updateResult = await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      {
        $push: { comments: newComment as any },
        $set: { updatedAt: new Date() },
      },
    );

    if (!updateResult.acknowledged) {
      return errorResponse('Failed to add comment', 500);
    }

    // Return comment with user info
    const commentResponse = {
      ...newComment,
      _id: newComment._id.toString(),
      userId: {
        _id: user._id.toString(),
        name: user.name,
        picture: user.picture,
        email: user.email,
      },
    };

    return successResponse({
      comment: commentResponse,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return errorResponse('Failed to add comment', 500);
  }
}
