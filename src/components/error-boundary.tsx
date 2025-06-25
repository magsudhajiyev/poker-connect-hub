import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw, Bug } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  title?: string;
  description?: string;
  showRetry?: boolean;
  showGoHome?: boolean;
  showReportBug?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const errorDetails = {
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // In a real app, you'd send this to your error reporting service
    console.log('Bug report data:', errorDetails);
    
    // For now, copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => alert('Error details copied to clipboard. Please send this to our support team.'))
      .catch(() => alert('Unable to copy error details. Please take a screenshot.'));
  };

  render() {
    if (this.state.hasError) {
      const {
        title = 'Something went wrong',
        description = 'An unexpected error occurred. Please try again.',
        showRetry = true,
        showGoHome = true,
        showReportBug = false,
      } = this.props;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 text-red-500">
                <AlertTriangle className="h-full w-full" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                {title}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm font-medium text-red-800 mb-1">Error Details:</p>
                  <p className="text-xs text-red-700 font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col space-y-2">
                {showRetry && (
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                )}
                
                {showGoHome && (
                  <Button onClick={this.handleGoHome} variant="outline" className="w-full">
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Button>
                )}
                
                {showReportBug && (
                  <Button onClick={this.handleReportBug} variant="ghost" className="w-full">
                    <Bug className="mr-2 h-4 w-4" />
                    Report Bug
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const handleError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);
    
    // In production, report to error service
    if (process.env.NODE_ENV === 'production') {
      console.warn('Error should be reported to error service:', {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      });
    }
  };

  return { handleError };
};

// Specialized ShareHand Error Boundary
export class ShareHandErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log ShareHand specific errors with more context
    console.error('ShareHand Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      context: 'share-hand-workflow',
    });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    // For ShareHand, we might want to reset form data or try to recover state
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    
    // Try to preserve form data by storing in sessionStorage
    const formData = sessionStorage.getItem('shareHandFormData');
    if (formData) {
      console.log('Attempting to recover form data after error');
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 text-amber-500">
                <AlertTriangle className="h-full w-full" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Share Hand Error
              </CardTitle>
              <CardDescription className="text-gray-600">
                Something went wrong while sharing your hand. Your progress may be saved.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm font-medium text-amber-800 mb-1">Poker Engine Error:</p>
                  <p className="text-xs text-amber-700 font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <div className="flex flex-col space-y-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/feed'} 
                  variant="outline" 
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go to Feed
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}