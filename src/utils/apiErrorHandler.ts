import { toast } from '@/hooks/use-toast';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export class ApiErrorHandler {
  /**
   * Handle and format API errors consistently
   */
  static handleError(error: unknown, context?: string): ApiError {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error);

    let apiError: ApiError = {
      message: 'An unexpected error occurred',
    };

    if (error instanceof Error) {
      apiError.message = error.message;
      
      // Handle fetch/network errors
      if ('status' in error && typeof error.status === 'number') {
        apiError.status = error.status;
        
        switch (error.status) {
          case 400:
            apiError.message = 'Invalid request. Please check your input and try again.';
            break;
          case 401:
            apiError.message = 'Authentication required. Please log in and try again.';
            break;
          case 403:
            apiError.message = 'Access denied. You don\'t have permission to perform this action.';
            break;
          case 404:
            apiError.message = 'The requested resource was not found.';
            break;
          case 408:
            apiError.message = 'Request timeout. Please try again.';
            break;
          case 429:
            apiError.message = 'Too many requests. Please wait a moment and try again.';
            break;
          case 500:
            apiError.message = 'Server error. Please try again later.';
            break;
          case 502:
          case 503:
          case 504:
            apiError.message = 'Service temporarily unavailable. Please try again later.';
            break;
          default:
            if (error.status >= 500) {
              apiError.message = 'Server error. Please try again later.';
            } else if (error.status >= 400) {
              apiError.message = 'Request error. Please check your input and try again.';
            }
        }
      }
      
      // Handle specific error types
      if (error.name === 'NetworkError' || error.message.includes('fetch')) {
        apiError.message = 'Network error. Please check your internet connection and try again.';
      }
      
      if (error.name === 'TimeoutError') {
        apiError.message = 'Request timeout. Please try again.';
      }
      
      if (error.name === 'AbortError') {
        apiError.message = 'Request was cancelled.';
      }
    } else if (typeof error === 'string') {
      apiError.message = error;
    } else if (error && typeof error === 'object') {
      // Handle response objects with error details
      if ('message' in error && typeof error.message === 'string') {
        apiError.message = error.message;
      }
      if ('status' in error && typeof error.status === 'number') {
        apiError.status = error.status;
      }
      if ('code' in error && typeof error.code === 'string') {
        apiError.code = error.code;
      }
      apiError.details = error;
    }

    return apiError;
  }

  /**
   * Show error toast notification
   */
  static showErrorToast(error: ApiError, title?: string) {
    toast({
      title: title || 'Error',
      description: error.message,
      variant: 'destructive',
    });
  }

  /**
   * Handle error and show toast in one call
   */
  static handleAndShow(error: unknown, context?: string, title?: string): ApiError {
    const apiError = this.handleError(error, context);
    this.showErrorToast(apiError, title);
    return apiError;
  }

  /**
   * Create a retry-able error handler
   */
  static createRetryableHandler(
    operation: () => Promise<void>,
    maxRetries: number = 3,
    context?: string
  ) {
    return async (): Promise<boolean> => {
      let lastError: ApiError | null = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await operation();
          return true;
        } catch (error) {
          lastError = this.handleError(error, context);
          
          if (attempt === maxRetries) {
            this.showErrorToast(lastError, `Failed after ${maxRetries} attempts`);
            return false;
          }
          
          // Don't retry on client errors (4xx)
          if (lastError.status && lastError.status >= 400 && lastError.status < 500) {
            this.showErrorToast(lastError);
            return false;
          }
          
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      return false;
    };
  }

  /**
   * Validate response and throw if not ok
   */
  static async validateResponse(response: Response): Promise<Response> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If we can't parse the response, use the default message
      }
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }
    
    return response;
  }

  /**
   * Wrapper for fetch with error handling
   */
  static async fetchWithErrorHandling(
    url: string,
    options?: RequestInit,
    timeout: number = 10000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return await this.validateResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }
}

// Convenience functions
export const handleApiError = ApiErrorHandler.handleError;
export const showErrorToast = ApiErrorHandler.showErrorToast;
export const handleAndShowError = ApiErrorHandler.handleAndShow;
export const createRetryableHandler = ApiErrorHandler.createRetryableHandler;
export const fetchWithErrorHandling = ApiErrorHandler.fetchWithErrorHandling;