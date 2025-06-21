import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingErrorProps {
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  loadingText?: string;
  errorTitle?: string;
  children?: React.ReactNode;
  className?: string;
  skeletonRows?: number;
  showSkeleton?: boolean;
}

const LoadingError: React.FC<LoadingErrorProps> = ({
  isLoading = false,
  error = null,
  onRetry,
  loadingText = 'Loading...',
  errorTitle = 'Failed to load',
  children,
  className,
  skeletonRows = 3,
  showSkeleton = true,
}) => {
  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm text-slate-400">{loadingText}</span>
          </div>
          {showSkeleton && (
            <div className="space-y-3">
              {Array.from({ length: skeletonRows }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-full bg-slate-800" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('w-full border-destructive bg-destructive/10', className)}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-destructive">{errorTitle}</h3>
              <p className="text-sm text-slate-300 mt-1">{error}</p>
              {onRetry && (
                <Button
                  onClick={onRetry}
                  size="sm"
                  className="mt-3 h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default LoadingError;