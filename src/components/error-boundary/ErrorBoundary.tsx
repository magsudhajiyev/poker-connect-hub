import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  showErrorDetails?: boolean;
  title?: string;
  description?: string;
  showRetry?: boolean;
  showGoHome?: boolean;
  showReportBug?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  eventId: string | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      eventId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      errorInfo,
    });

    // Log error to console for development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when resetKeys change
    if (hasError && resetOnPropsChange && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevResetKeys[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // This is where you would integrate with error reporting services
    // like Sentry, LogRocket, or similar
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      eventId: this.state.eventId,
    };

    // For now, just log to console
    console.error('Error reported to service:', errorData);
  };

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorInfo, eventId } = this.state;
    const errorDetails = {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace available',
      componentStack: errorInfo?.componentStack || 'No component stack available',
      eventId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    // Create a pre-filled GitHub issue or bug report
    const bugReportUrl = `mailto:support@pokerconnecthub.com?subject=Bug Report - ${eventId}&body=${encodeURIComponent(
      `Error Details:\n${JSON.stringify(errorDetails, null, 2)}\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected behavior:\n\nActual behavior:\n`
    )}`;

    window.open(bugReportUrl, '_blank');
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const {
      children,
      fallback,
      title = 'Something went wrong',
      description = 'An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.',
      showErrorDetails = false,
      showRetry = true,
      showGoHome = true,
      showReportBug = false,
    } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6">
            <Alert className="border-destructive bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-destructive">{title}</AlertTitle>
              <AlertDescription className="text-slate-300">
                {description}
              </AlertDescription>
            </Alert>

            {showErrorDetails && error && (
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-medium text-slate-300">Error Details</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-400">Message:</p>
                    <p className="text-sm text-slate-200 font-mono bg-slate-800 p-2 rounded text-wrap break-words">
                      {error.message}
                    </p>
                  </div>
                  {error.stack && (
                    <div>
                      <p className="text-xs text-slate-400">Stack Trace:</p>
                      <pre className="text-xs text-slate-200 font-mono bg-slate-800 p-2 rounded overflow-auto max-h-32">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  {errorInfo?.componentStack && (
                    <div>
                      <p className="text-xs text-slate-400">Component Stack:</p>
                      <pre className="text-xs text-slate-200 font-mono bg-slate-800 p-2 rounded overflow-auto max-h-32">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              {showRetry && (
                <Button
                  onClick={this.handleRetry}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              {showGoHome && (
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              )}
              {showReportBug && (
                <Button
                  onClick={this.handleReportBug}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <Bug className="h-4 w-4 mr-2" />
                  Report Bug
                </Button>
              )}
            </div>

            <div className="text-center">
              <p className="text-xs text-slate-400">
                Error ID: {this.state.eventId}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;