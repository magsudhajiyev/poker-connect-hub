import { ObjectId } from 'mongodb';
import { Post, PostComment } from '@/models/post.model';
import { User } from '@/models/user.model';

// Database document types
export interface PostDocument extends Omit<Post, '_id' | 'userId' | 'comments'> {
  _id: ObjectId;
  userId: ObjectId;
  comments: CommentDocument[];
}

export interface CommentDocument extends Omit<PostComment, '_id' | 'userId'> {
  _id: ObjectId;
  userId: ObjectId;
}

export interface UserDocument extends Omit<User, '_id'> {
  _id: ObjectId;
}

// Query types
export interface PostQuery {
  userId?: ObjectId;
  $or?: Array<{
    content?: { $regex: string; $options: string };
    'userId.name'?: { $regex: string; $options: string };
  }>;
  createdAt?: { $gte: Date };
}

// Aggregation types
export interface PostWithUserInfo extends Omit<PostDocument, 'userId'> {
  userId: {
    _id: string;
    name: string;
    picture?: string;
    email: string;
  };
  userInfo?: UserDocument[]; // Temporary field from $lookup
}

export interface CommentWithUserInfo extends Omit<CommentDocument, 'userId'> {
  userId:
    | {
        _id: string;
        name: string;
        picture?: string;
        email: string;
      }
    | ObjectId;
}
