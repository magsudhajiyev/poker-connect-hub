import { ApiResponse } from '@/types/unified';
import { ApiErrorHandler } from '@/utils/apiErrorHandler';
import axios from 'axios';

// Type definitions for poker game data
export interface PlayerPosition {
  name: string;
  chips: number;
  isHero?: boolean;
}

export interface HoleCards {
  card1: string;
  card2: string;
}

export interface PokerAction {
  playerId: string;
  playerName: string;
  action: string;
  amount?: number;
  position?: string;
  isHero?: boolean;
}

export interface AnalysisData {
  summary?: string;
  keyPoints?: string[];
  suggestions?: string[];
  [key: string]: unknown;
}

export interface SharedHandFormData {
  title: string;
  description: string;
  gameType: string;
  gameFormat: string;
  tableSize: number;
  positions: Record<string, PlayerPosition>;
  preflopCards: Record<string, HoleCards>;
  preflopActions?: PokerAction[];
  flopCards?: string[];
  flopActions?: PokerAction[];
  turnCard?: string;
  turnActions?: PokerAction[];
  riverCard?: string;
  riverActions?: PokerAction[];
  analysis?: AnalysisData;
  tags?: string[];
  isPublic?: boolean;
  userEmail?: string;
}

export interface SharedHand extends SharedHandFormData {
  _id: string;
  userId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
        picture?: string;
      };
  likes: string[];
  likeCount: number;
  viewCount: number;
  commentCount: number;
  comments: Array<{
    userId:
      | string
      | {
          _id: string;
          name: string;
          picture?: string;
        };
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SharedHandsListResponse {
  hands: SharedHand[];
  total: number;
}

export interface ListQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  tags?: string[];
  search?: string;
  dateRange?: string;
  gameType?: string[];
  positions?: string[];
  stakes?: string[];
}

export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

export interface CommentResponse {
  comment: {
    _id?: string;
    userId:
      | string
      | {
          _id: string;
          name: string;
          picture?: string;
        };
    content: string;
    createdAt: string;
  };
  commentCount: number;
}

export interface UserProfile {
  user: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    authProvider: string;
    createdAt: string;
    hasCompletedOnboarding: boolean;
  };
  stats: {
    totalHands: number;
    totalLikes: number;
    totalComments: number;
    memberSince: string;
  };
  recentHands: Array<{
    _id: string;
    title: string;
    description: string;
    gameType: string;
    gameFormat: string;
    createdAt: string;
    likeCount: number;
    commentCount: number;
  }>;
}

// Create axios instance for Next.js API routes
const api = axios.create({
  baseURL: '', // Use relative URLs for same-origin API calls
  withCredentials: true, // Include cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

class SharedHandsApiService {
  async createSharedHand(data: SharedHandFormData): Promise<ApiResponse<SharedHand>> {
    try {
      const response = await api.post('/api/hands/create', data);
      return response.data;
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  }

  async getSharedHands(params?: ListQueryParams): Promise<ApiResponse<SharedHandsListResponse>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params?.userId) {
        queryParams.append('userId', params.userId);
      }
      if (params?.search) {
        queryParams.append('search', params.search);
      }
      if (params?.tags && params.tags.length > 0) {
        params.tags.forEach((tag) => queryParams.append('tags', tag));
      }
      if (params?.dateRange) {
        queryParams.append('dateRange', params.dateRange);
      }
      if (params?.gameType && params.gameType.length > 0) {
        params.gameType.forEach((type) => queryParams.append('gameType', type));
      }
      if (params?.positions && params.positions.length > 0) {
        params.positions.forEach((pos) => queryParams.append('positions', pos));
      }
      if (params?.stakes && params.stakes.length > 0) {
        params.stakes.forEach((stake) => queryParams.append('stakes', stake));
      }

      const url = `/api/hands/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  }

  async getSharedHand(id: string): Promise<ApiResponse<SharedHand>> {
    try {
      const response = await api.get(`/api/hands/${id}`);
      return response.data;
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  }

  async getUserSharedHands(userId: string): Promise<ApiResponse<SharedHand[]>> {
    try {
      const response = await api.get(`/api/hands/user/${userId}`);
      return response.data;
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  }

  async updateSharedHand(
    id: string,
    data: Partial<SharedHandFormData>,
  ): Promise<ApiResponse<SharedHand>> {
    try {
      const response = await api.patch(`/api/hands/${id}`, data);
      return response.data;
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  }

  async deleteSharedHand(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/api/hands/${id}`);
      return response.data;
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  }

  async toggleLike(handId: string, _userEmail?: string): Promise<ApiResponse<LikeResponse>> {
    try {
      const response = await api.post(`/api/hands/${handId}/like`, {});
      return response.data;
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  }

  async addComment(handId: string, content: string): Promise<ApiResponse<CommentResponse>> {
    try {
      const response = await api.post(`/api/hands/${handId}/comments`, { content });
      return response.data;
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  }

  async deleteComment(
    handId: string,
    commentId: string,
  ): Promise<ApiResponse<{ commentCount: number }>> {
    try {
      const response = await api.delete(`/api/hands/${handId}/comments/${commentId}`);
      return response.data;
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  }

  async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response.data;
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  }
}

export const sharedHandsApi = new SharedHandsApiService();
