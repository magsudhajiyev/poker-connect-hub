import { useState, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { logError, logInfo } from '@/utils/errorLogger';

interface ErrorRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  context?: string;
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

interface ErrorRecoveryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: string | null;
  canRetry: boolean;
}

export const useErrorRecovery = () => {
  const [state, setState] = useState<ErrorRecoveryState>({
    isRetrying: false,
    retryCount: 0,
    lastError: null,
    canRetry: true,
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearRetryTimeout = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    clearRetryTimeout();
    setState({
      isRetrying: false,
      retryCount: 0,
      lastError: null,
      canRetry: true,
    });
  }, [clearRetryTimeout]);

  const executeWithRetry = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options: ErrorRecoveryOptions = {}
    ): Promise<T | null> => {
      const {
        maxRetries = 3,
        retryDelay = 1000,
        exponentialBackoff = true,
        context = 'Operation',
        onSuccess,
        onFailure,
        shouldRetry = (error, attempt) => {
          // Don't retry on client errors (4xx) or after max retries
          const isClientError = 'status' in error && 
            typeof error.status === 'number' && 
            error.status >= 400 && 
            error.status < 500;
          return !isClientError && attempt < maxRetries;
        },
      } = options;

      setState(prev => ({
        ...prev,
        isRetrying: false,
        lastError: null,
      }));

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          setState(prev => ({ ...prev, isRetrying: attempt > 1 }));
          
          const result = await operation();
          
          // Success
          setState(prev => ({
            ...prev,
            isRetrying: false,
            retryCount: attempt - 1,
            lastError: null,
          }));

          if (attempt > 1) {
            logInfo(`${context} succeeded after ${attempt - 1} retries`, 'ErrorRecovery');
            toast({
              title: 'Success',
              description: `${context} completed successfully`,
            });
          }

          onSuccess?.();
          return result;

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          setState(prev => ({
            ...prev,
            retryCount: attempt,
            lastError: errorMessage,
            canRetry: shouldRetry(error as Error, attempt),
          }));

          logError(
            `${context} failed on attempt ${attempt}: ${errorMessage}`,
            'ErrorRecovery',
            { attempt, maxRetries, error: error instanceof Error ? error.stack : error }
          );

          if (attempt === maxRetries || !shouldRetry(error as Error, attempt)) {
            // Final failure
            setState(prev => ({
              ...prev,
              isRetrying: false,
              canRetry: false,
            }));

            onFailure?.(error as Error);
            
            toast({
              title: 'Operation Failed',
              description: `${context} failed after ${attempt} attempts: ${errorMessage}`,
              variant: 'destructive',
            });

            return null;
          }

          // Wait before retry
          const delay = exponentialBackoff 
            ? retryDelay * Math.pow(2, attempt - 1) 
            : retryDelay;

          await new Promise(resolve => {
            retryTimeoutRef.current = setTimeout(resolve, delay);
          });
        }
      }

      return null;
    },
    [clearRetryTimeout]
  );

  const retryOperation = useCallback(
    async <T>(operation: () => Promise<T>, options?: ErrorRecoveryOptions): Promise<T | null> => {
      if (!state.canRetry) {
        toast({
          title: 'Cannot Retry',
          description: 'This operation cannot be retried at this time',
          variant: 'destructive',
        });
        return null;
      }

      return executeWithRetry(operation, options);
    },
    [state.canRetry, executeWithRetry]
  );

  const createRetryableFunction = useCallback(
    <T extends any[], R>(
      fn: (...args: T) => Promise<R>,
      options?: ErrorRecoveryOptions
    ) => {
      return async (...args: T): Promise<R | null> => {
        return executeWithRetry(() => fn(...args), options);
      };
    },
    [executeWithRetry]
  );

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    clearRetryTimeout();
  }, [clearRetryTimeout]);

  return {
    state,
    executeWithRetry,
    retryOperation,
    createRetryableFunction,
    resetState,
    cleanup,
  };
};

// Higher-order component for error recovery
export const withErrorRecovery = <P extends object>(
  Component: React.ComponentType<P>,
  defaultOptions?: ErrorRecoveryOptions
) => {
  return (props: P) => {
    const errorRecovery = useErrorRecovery();
    
    return (
      <Component 
        {...props} 
        errorRecovery={errorRecovery}
        executeWithRetry={(operation: () => Promise<any>, options?: ErrorRecoveryOptions) =>
          errorRecovery.executeWithRetry(operation, { ...defaultOptions, ...options })
        }
      />
    );
  };
};

export default useErrorRecovery;