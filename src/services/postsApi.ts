import { backendAuthApi } from './backendAuthApi';
import {
  CreatePostInput,
  PostResponse,
  PostsListResponse,
  LikeResponse,
  CommentResponse,
} from '@/models/post.model';
import { ApiAxiosError } from '@/types/errors';

export const postsApi = {
  // Create a new post
  createPost: async (data: CreatePostInput): Promise<PostResponse> => {
    try {
      const response = await backendAuthApi.post('/posts/create', data);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      const axiosError = error as ApiAxiosError;
      return {
        success: false,
        error: axiosError.response?.data?.error || 'Failed to create post',
      };
    }
  },

  // List posts
  listPosts: async (params?: {
    page?: number;
    pageSize?: number;
    userId?: string;
  }): Promise<PostsListResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.pageSize) {
        queryParams.append('pageSize', params.pageSize.toString());
      }
      if (params?.userId) {
        queryParams.append('userId', params.userId);
      }

      const response = await backendAuthApi.get(`/posts/list?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error listing posts:', error);
      const axiosError = error as ApiAxiosError;
      return {
        success: false,
        error: axiosError.response?.data?.error || 'Failed to list posts',
      };
    }
  },

  // Get a single post
  getPost: async (postId: string): Promise<PostResponse> => {
    try {
      const response = await backendAuthApi.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting post:', error);
      const axiosError = error as ApiAxiosError;
      return {
        success: false,
        error: axiosError.response?.data?.error || 'Failed to get post',
      };
    }
  },

  // Toggle like on a post
  toggleLike: async (postId: string): Promise<LikeResponse> => {
    try {
      const response = await backendAuthApi.post(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error toggling like:', error);
      const axiosError = error as ApiAxiosError;
      return {
        success: false,
        error: axiosError.response?.data?.error || 'Failed to toggle like',
      };
    }
  },

  // Add a comment to a post
  addComment: async (postId: string, content: string): Promise<CommentResponse> => {
    try {
      const response = await backendAuthApi.post(`/posts/${postId}/comments`, { content });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      const axiosError = error as ApiAxiosError;
      return {
        success: false,
        error: axiosError.response?.data?.error || 'Failed to add comment',
      };
    }
  },

  // Edit a post
  editPost: async (postId: string, content: string): Promise<PostResponse> => {
    try {
      const response = await backendAuthApi.put(`/posts/${postId}`, { content });
      return response.data;
    } catch (error) {
      console.error('Error editing post:', error);
      const axiosError = error as ApiAxiosError;
      return {
        success: false,
        error: axiosError.response?.data?.error || 'Failed to edit post',
      };
    }
  },

  // Delete a post
  deletePost: async (postId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await backendAuthApi.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting post:', error);
      const axiosError = error as ApiAxiosError;
      return {
        success: false,
        error: axiosError.response?.data?.error || 'Failed to delete post',
      };
    }
  },
};
