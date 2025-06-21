import React from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormErrorProps {
  message?: string;
  className?: string;
  variant?: 'default' | 'destructive';
  showIcon?: boolean;
}

const FormError: React.FC<FormErrorProps> = ({
  message,
  className,
  variant = 'destructive',
  showIcon = true,
}) => {
  if (!message) return null;

  const variants = {
    default: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10',
    destructive: 'text-destructive border-destructive/20 bg-destructive/10',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 p-3 text-sm border rounded-md',
        variants[variant],
        className
      )}
    >
      {showIcon && (
        <div className="flex-shrink-0">
          {variant === 'destructive' ? (
            <XCircle className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
        </div>
      )}
      <span className="flex-1">{message}</span>
    </div>
  );
};

export default FormError;