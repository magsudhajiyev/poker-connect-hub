import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ShareHandErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

const ShareHandErrorFallback: React.FC<{ onRetry: () => void; onGoBack: () => void }> = ({
  onRetry,
  onGoBack,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        <Alert className="border-destructive bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-destructive">Hand Sharing Error</AlertTitle>
          <AlertDescription className="text-slate-300">
            We encountered an issue while processing your poker hand. This could be due to invalid 
            game state, network issues, or unexpected input. Your progress may have been lost.
          </AlertDescription>
        </Alert>

        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-medium text-slate-300">What you can do:</h3>
          <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
            <li>Try again with the same hand configuration</li>
            <li>Go back and start with a new hand</li>
            <li>Check that all player positions are correctly set</li>
            <li>Verify that blind amounts are valid numbers</li>
            <li>Ensure all required cards are selected</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onRetry}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={onGoBack}
            variant="outline"
            className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Start Over
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-400">
            If this error persists, please try refreshing the page or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

const ShareHandErrorBoundary: React.FC<ShareHandErrorBoundaryProps> = ({
  children,
  onReset,
}) => {
  const navigate = useNavigate();

  const handleShareHandError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log specific share hand errors
    console.error('ShareHand Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      context: 'ShareHand workflow',
    });

    // In production, you might want to send this to your analytics/error reporting
    if (process.env.NODE_ENV === 'production') {
      // Track share hand specific errors
      console.warn('Share hand error in production - should be reported to error service');
    }
  };

  const handleRetry = () => {
    if (onReset) {
      onReset();
    }
    // The error boundary will reset automatically
  };

  const handleGoBack = () => {
    navigate('/feed');
  };

  return (
    <ErrorBoundary
      fallback={
        <ShareHandErrorFallback
          onRetry={handleRetry}
          onGoBack={handleGoBack}
        />
      }
      onError={handleShareHandError}
      resetOnPropsChange={true}
      resetKeys={[]} // Will reset when any props change
      showErrorDetails={import.meta.env.DEV}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ShareHandErrorBoundary;