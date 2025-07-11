import { ObjectId } from 'mongodb';

export interface Post {
  _id?: ObjectId | string;
  userId: ObjectId | string | User; // Can be populated with user data
  content: string;
  likes: string[]; // Array of user IDs who liked the post
  likeCount: number;
  comments: PostComment[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PostComment {
  _id?: ObjectId | string;
  userId: ObjectId | string | User; // Can be populated with user data
  content: string;
  createdAt: Date | string;
}

// For populated user data
interface User {
  _id: string;
  name: string;
  picture?: string;
  email: string;
}

// Create post input
export interface CreatePostInput {
  content: string;
}

// API response types
export interface PostResponse {
  success: boolean;
  data?: Post;
  error?: string;
}

export interface PostsListResponse {
  success: boolean;
  data?: {
    posts: Post[];
    totalCount: number;
    page: number;
    pageSize: number;
  };
  error?: string;
}

export interface LikeResponse {
  success: boolean;
  data?: {
    liked: boolean;
    likeCount: number;
  };
  error?: string;
}

export interface CommentResponse {
  success: boolean;
  data?: {
    comment: PostComment;
  };
  error?: string;
}
