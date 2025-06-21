import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, XCircle, AlertCircle, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  variant?: 'alert' | 'card' | 'inline';
  showIcon?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  details?: string;
  showDetails?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title,
  message,
  type = 'error',
  variant = 'alert',
  showIcon = true,
  dismissible = false,
  onDismiss,
  onRetry,
  retryText = 'Try Again',
  className,
  details,
  showDetails = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'error':
        return {
          container: 'border-destructive bg-destructive/10',
          icon: 'text-destructive',
          title: 'text-destructive',
          text: 'text-slate-300',
        };
      case 'warning':
        return {
          container: 'border-yellow-600 bg-yellow-600/10',
          icon: 'text-yellow-500',
          title: 'text-yellow-500',
          text: 'text-slate-300',
        };
      case 'info':
        return {
          container: 'border-blue-600 bg-blue-600/10',
          icon: 'text-blue-500',
          title: 'text-blue-500',
          text: 'text-slate-300',
        };
      default:
        return {
          container: 'border-destructive bg-destructive/10',
          icon: 'text-destructive',
          title: 'text-destructive',
          text: 'text-slate-300',
        };
    }
  };

  const colors = getColorClasses();

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-start gap-2 p-3 rounded-md', colors.container, className)}>
        {showIcon && <div className={colors.icon}>{getIcon()}</div>}
        <div className="flex-1 min-w-0">
          {title && (
            <p className={cn('font-medium text-sm', colors.title)}>{title}</p>
          )}
          <p className={cn('text-sm', colors.text)}>{message}</p>
          {showDetails && details && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-300">
                Show details
              </summary>
              <pre className="mt-1 text-xs text-slate-400 font-mono bg-slate-800 p-2 rounded overflow-auto">
                {details}
              </pre>
            </details>
          )}
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="mt-2 h-7 px-3 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {retryText}
            </Button>
          )}
        </div>
        {dismissible && onDismiss && (
          <Button
            onClick={onDismiss}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-slate-700"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={cn(colors.container, className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {showIcon && <div className={colors.icon}>{getIcon()}</div>}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className={cn('font-medium text-sm mb-1', colors.title)}>{title}</h3>
              )}
              <p className={cn('text-sm', colors.text)}>{message}</p>
              {showDetails && details && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-300">
                    Technical details
                  </summary>
                  <pre className="mt-2 text-xs text-slate-400 font-mono bg-slate-800 p-2 rounded overflow-auto max-h-32">
                    {details}
                  </pre>
                </details>
              )}
              <div className="flex gap-2 mt-3">
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    size="sm"
                    className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {retryText}
                  </Button>
                )}
                {dismissible && onDismiss && (
                  <Button
                    onClick={onDismiss}
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Dismiss
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default alert variant
  return (
    <Alert className={cn(colors.container, className)}>
      {showIcon && getIcon()}
      {title && <AlertTitle className={colors.title}>{title}</AlertTitle>}
      <AlertDescription className={colors.text}>
        {message}
        {showDetails && details && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-300">
              Show technical details
            </summary>
            <pre className="mt-1 text-xs text-slate-400 font-mono bg-slate-800 p-2 rounded overflow-auto">
              {details}
            </pre>
          </details>
        )}
        <div className="flex gap-2 mt-3">
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {retryText}
            </Button>
          )}
          {dismissible && onDismiss && (
            <Button
              onClick={onDismiss}
              size="sm"
              variant="outline"
              className="h-7 px-3 text-xs border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ErrorDisplay;