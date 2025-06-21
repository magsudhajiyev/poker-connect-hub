// Error Boundary component for handling API and React errors

import React from 'react';
import { ApiErrorType } from '@/types/unified';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} reset={this.reset} />;
      }

      return (
        <ErrorFallback error={this.state.error} reset={this.reset} />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  const isApiError = 'type' in error;
  const apiError = error as any;

  const getErrorMessage = () => {
    if (isApiError) {
      switch (apiError.type) {
        case ApiErrorType.NETWORK_ERROR:
          return 'Network connection failed. Please check your internet connection and try again.';
        case ApiErrorType.TIMEOUT_ERROR:
          return 'Request timed out. The server may be busy. Please try again.';
        case ApiErrorType.VALIDATION_ERROR:
          return 'Invalid data provided. Please check your input and try again.';
        case ApiErrorType.SERVER_ERROR:
          return 'Server error occurred. Please try again later.';
        default:
          return 'An unexpected error occurred. Please try again.';
      }
    }
    return error.message || 'An unexpected error occurred.';
  };

  const getErrorTitle = () => {
    if (isApiError) {
      switch (apiError.type) {
        case ApiErrorType.NETWORK_ERROR:
          return 'Connection Error';
        case ApiErrorType.TIMEOUT_ERROR:
          return 'Timeout Error';
        case ApiErrorType.VALIDATION_ERROR:
          return 'Validation Error';
        case ApiErrorType.SERVER_ERROR:
          return 'Server Error';
        default:
          return 'Error';
      }
    }
    return 'Application Error';
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-red-200">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.888-.833-2.598 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">
                {getErrorTitle()}
              </h3>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-red-600">
              {getErrorMessage()}
            </p>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mb-4">
              <summary className="text-xs text-gray-500 cursor-pointer">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for handling async errors in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error('Error handled by useErrorHandler:', error);
    setError(error);
  }, []);

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw error;
  }

  return { handleError, resetError };
}