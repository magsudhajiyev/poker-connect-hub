import { NextRequest } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser, errorResponse, successResponse } from '@/lib/api-utils';
import { CreatePostInput } from '@/models/post.model';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    // Get current user from JWT
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return errorResponse('Unauthorized', 401);
    }

    // Parse request body
    const body: CreatePostInput = await request.json();

    // Validate content
    if (!body.content || body.content.trim().length === 0) {
      return errorResponse('Post content is required', 400);
    }

    if (body.content.length > 500) {
      return errorResponse('Post content must be 500 characters or less', 400);
    }

    const db = await getDatabase();
    const postsCollection = db.collection('posts');
    const usersCollection = db.collection('users');

    // Get user info for the post
    const user = await usersCollection.findOne({ _id: new ObjectId(currentUser.userId) });
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Create new post
    const newPost = {
      userId: new ObjectId(currentUser.userId),
      content: body.content.trim(),
      likes: [],
      likeCount: 0,
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await postsCollection.insertOne(newPost);

    // Return the created post with user info
    const createdPost = {
      ...newPost,
      _id: result.insertedId,
      userId: {
        _id: user._id.toString(),
        name: user.name,
        picture: user.picture,
        email: user.email,
      },
    };

    return successResponse(createdPost);
  } catch (error) {
    console.error('Error creating post:', error);
    return errorResponse('Failed to create post', 500);
  }
}
