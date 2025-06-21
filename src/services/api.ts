// Base API service with error handling, retry logic, and proper typing

import { ApiResponse, ApiError, ApiErrorType } from '@/types/unified';

export interface ApiConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export class ApiService {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;

  constructor(config: ApiConfig = {}) {
    this.baseUrl = config.baseUrl || import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this.timeout = config.timeout || 10000; // 10 seconds
    this.retries = config.retries || 3;
    this.retryDelay = config.retryDelay || 1000; // 1 second
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createApiError(
    message: string,
    type: ApiErrorType,
    code?: string,
    details?: any,
    retryable: boolean = false
  ): ApiError {
    const error = new Error(message) as ApiError;
    error.type = type;
    error.code = code;
    error.details = details;
    error.retryable = retryable;
    return error;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createApiError(
          'Request timeout',
          ApiErrorType.TIMEOUT_ERROR,
          'TIMEOUT',
          { timeout: this.timeout },
          true
        );
      }
      throw error;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        console.log(`API Request (attempt ${attempt}/${this.retries}):`, {
          method: options.method || 'GET',
          url,
          body: options.body ? JSON.parse(options.body as string) : undefined,
        });

        const response = await this.fetchWithTimeout(url, options);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Handle different HTTP error codes
          switch (response.status) {
            case 400:
              throw this.createApiError(
                errorData.message || 'Bad Request',
                ApiErrorType.VALIDATION_ERROR,
                'BAD_REQUEST',
                errorData,
                false
              );
            case 500:
            case 502:
            case 503:
            case 504:
              throw this.createApiError(
                errorData.message || 'Server Error',
                ApiErrorType.SERVER_ERROR,
                `HTTP_${response.status}`,
                errorData,
                true
              );
            default:
              throw this.createApiError(
                errorData.message || `HTTP ${response.status}`,
                ApiErrorType.SERVER_ERROR,
                `HTTP_${response.status}`,
                errorData,
                response.status >= 500
              );
          }
        }

        const data = await response.json();
        console.log('API Response:', data);

        return {
          success: true,
          data,
        };

      } catch (error) {
        lastError = error as Error;
        console.error(`Api request failed (attempt ${attempt}/${this.retries}):`, error);

        // Check if error is retryable
        const apiError = error as ApiError;
        const isRetryable = apiError.retryable || 
                           apiError.type === ApiErrorType.NETWORK_ERROR ||
                           apiError.type === ApiErrorType.TIMEOUT_ERROR ||
                           apiError.type === ApiErrorType.SERVER_ERROR;

        // Don't retry if it's the last attempt or error is not retryable
        if (attempt === this.retries || !isRetryable) {
          break;
        }

        // Wait before retrying with exponential backoff
        await this.delay(this.retryDelay * Math.pow(2, attempt - 1));
      }
    }

    // All retries failed, return error response
    const finalError = lastError as ApiError;
    return {
      success: false,
      error: {
        message: finalError.message || 'Unknown error occurred',
        code: finalError.code,
        details: finalError.details,
      },
    };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create a singleton instance
export const apiService = new ApiService();