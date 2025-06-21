interface ErrorLogEntry {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  context?: string;
  stack?: string;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
  additionalData?: Record<string, unknown>;
}

interface ErrorLogger {
  error(message: string, context?: string, additionalData?: Record<string, unknown>): void;
  warning(message: string, context?: string, additionalData?: Record<string, unknown>): void;
  info(message: string, context?: string, additionalData?: Record<string, unknown>): void;
  logException(error: Error, context?: string, additionalData?: Record<string, unknown>): void;
  getLogs(): ErrorLogEntry[];
  clearLogs(): void;
  exportLogs(): string;
}

class PokerConnectErrorLogger implements ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private maxLogs: number = 1000;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    
    // Log unhandled errors
    window.addEventListener('error', (event) => {
      this.logException(event.error, 'Unhandled Error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Log unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error(`Unhandled Promise Rejection: ${event.reason}`, 'Promise Rejection', {
        reason: event.reason,
      });
    });
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogEntry(
    level: 'error' | 'warning' | 'info',
    message: string,
    context?: string,
    additionalData?: Record<string, unknown>
  ): ErrorLogEntry {
    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
      additionalData,
    };
  }

  private addLog(entry: ErrorLogEntry): void {
    this.logs.push(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console log in development
    if (import.meta.env.MODE === 'development') {
      const logMethod = entry.level === 'error' ? console.error : 
                      entry.level === 'warning' ? console.warn : console.log;
      
      logMethod(`[${entry.level.toUpperCase()}] ${entry.context ? `${entry.context}: ` : ''}${entry.message}`, {
        timestamp: entry.timestamp,
        additionalData: entry.additionalData,
      });
    }

    // In production, you might want to send logs to an external service
    if (import.meta.env.MODE === 'production' && entry.level === 'error') {
      this.sendToErrorService(entry);
    }
  }

  private async sendToErrorService(entry: ErrorLogEntry): Promise<void> {
    try {
      // This is where you would integrate with services like:
      // - Sentry
      // - LogRocket
      // - DataDog
      // - Custom logging endpoint
      
      console.warn('Error logging service not configured:', entry);
      
      // Example of sending to a custom endpoint:
      /*
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
      */
    } catch (err) {
      console.error('Failed to send error to logging service:', err);
    }
  }

  error(message: string, context?: string, additionalData?: Record<string, unknown>): void {
    const entry = this.createLogEntry('error', message, context, additionalData);
    this.addLog(entry);
  }

  warning(message: string, context?: string, additionalData?: Record<string, unknown>): void {
    const entry = this.createLogEntry('warning', message, context, additionalData);
    this.addLog(entry);
  }

  info(message: string, context?: string, additionalData?: Record<string, unknown>): void {
    const entry = this.createLogEntry('info', message, context, additionalData);
    this.addLog(entry);
  }

  logException(error: Error, context?: string, additionalData?: Record<string, unknown>): void {
    const entry = this.createLogEntry('error', error.message, context, {
      ...additionalData,
      stack: error.stack,
      name: error.name,
    });
    entry.stack = error.stack;
    this.addLog(entry);
  }

  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  getLogsByLevel(level: 'error' | 'warning' | 'info'): ErrorLogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  getLogsByContext(context: string): ErrorLogEntry[] {
    return this.logs.filter(log => log.context === context);
  }

  getLogsInTimeRange(startTime: Date, endTime: Date): ErrorLogEntry[] {
    return this.logs.filter(log => {
      const logTime = new Date(log.timestamp);
      return logTime >= startTime && logTime <= endTime;
    });
  }

  clearLogs(): void {
    this.logs = [];
    console.log('Error logs cleared');
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  getLogsSummary(): { errors: number; warnings: number; info: number; total: number } {
    const summary = this.logs.reduce(
      (acc, log) => {
        acc[log.level]++;
        acc.total++;
        return acc;
      },
      { errors: 0, warnings: 0, info: 0, total: 0 }
    );

    return {
      errors: summary.errors,
      warnings: summary.warnings,
      info: summary.info,
      total: summary.total,
    };
  }

  // Debug helper to manually trigger a test error
  triggerTestError(): void {
    this.error('Test error triggered manually', 'Debug', {
      testData: 'This is a test error for debugging purposes',
    });
  }
}

// Create singleton instance
const errorLogger = new PokerConnectErrorLogger();

// Export convenience functions
export const logError = (message: string, context?: string, data?: Record<string, unknown>) => 
  errorLogger.error(message, context, data);

export const logWarning = (message: string, context?: string, data?: Record<string, unknown>) => 
  errorLogger.warning(message, context, data);

export const logInfo = (message: string, context?: string, data?: Record<string, unknown>) => 
  errorLogger.info(message, context, data);

export const logException = (error: Error, context?: string, data?: Record<string, unknown>) => 
  errorLogger.logException(error, context, data);

export const getErrorLogs = () => errorLogger.getLogs();
export const clearErrorLogs = () => errorLogger.clearLogs();
export const exportErrorLogs = () => errorLogger.exportLogs();
export const getLogsSummary = () => errorLogger.getLogsSummary();

export default errorLogger;