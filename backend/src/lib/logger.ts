/**
 * Centralized logging utility
 * In production, this could be enhanced with Winston, Pino, or other logging libraries
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  [key: string]: any;
}

class Logger {
  private serviceName: string;

  constructor(serviceName: string = 'gift-economy-api') {
    this.serviceName = serviceName;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.serviceName}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage(LogLevel.INFO, message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const errorContext = error
      ? {
          ...context,
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        }
      : context;
    console.error(this.formatMessage(LogLevel.ERROR, message, errorContext));
  }

  /**
   * Create a child logger with additional context
   */
  child(childContext: LogContext): Logger {
    const childLogger = new Logger(this.serviceName);
    // In a more sophisticated implementation, we'd merge contexts
    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for creating custom instances
export { Logger };
