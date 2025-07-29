import { Injectable, LoggerService } from '@nestjs/common';
import {
  createLogger,
  format,
  transports,
  Logger as WinstonLogger,
} from 'winston';

@Injectable()
export class AppLoggerService implements LoggerService {
  private context?: string;
  private logger: WinstonLogger;

  constructor() {
    this.logger = createLogger({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: format.combine(
        format.timestamp(),
        format.ms(),
        format.errors({ stack: true }),
        format.json(),
      ),
      defaultMeta: { service: 'raidme-api' },
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(
              ({ timestamp, level, message, context, ms, ...meta }) => {
                return `[${timestamp}] [${level}] ${context ? `[${context}]` : ''} ${message} ${
                  Object.keys(meta).length ? JSON.stringify(meta) : ''
                } ${ms}`;
              },
            ),
          ),
        }),
        // Can add file transport for production
        ...(process.env.NODE_ENV === 'production'
          ? [
              new transports.File({
                filename: 'logs/error.log',
                level: 'error',
                maxsize: 10 * 1024 * 1024, // 10MB
                maxFiles: 5,
              }),
              new transports.File({
                filename: 'logs/combined.log',
                maxsize: 10 * 1024 * 1024, // 10MB
                maxFiles: 5,
              }),
            ]
          : []),
      ],
    });
  }

  setContext(context: string) {
    this.context = context;
    return this;
  }

  log(message: any, context?: string, ...optionalParams: any[]) {
    context = context || this.context;

    if (optionalParams.length > 0) {
      this.logger.info(message, { context, ...optionalParams[0] });
    } else {
      this.logger.info(message, { context });
    }
  }

  error(
    message: any,
    trace?: string,
    context?: string,
    ...optionalParams: any[]
  ) {
    context = context || this.context;

    if (optionalParams.length > 0) {
      this.logger.error(message, {
        context,
        stack: trace,
        ...optionalParams[0],
      });
    } else {
      this.logger.error(message, { context, stack: trace });
    }
  }

  warn(message: any, context?: string, ...optionalParams: any[]) {
    context = context || this.context;

    if (optionalParams.length > 0) {
      this.logger.warn(message, { context, ...optionalParams[0] });
    } else {
      this.logger.warn(message, { context });
    }
  }

  debug(message: any, context?: string, ...optionalParams: any[]) {
    context = context || this.context;

    if (optionalParams.length > 0) {
      this.logger.debug(message, { context, ...optionalParams[0] });
    } else {
      this.logger.debug(message, { context });
    }
  }

  verbose(message: any, context?: string, ...optionalParams: any[]) {
    context = context || this.context;

    if (optionalParams.length > 0) {
      this.logger.verbose(message, { context, ...optionalParams[0] });
    } else {
      this.logger.verbose(message, { context });
    }
  }

  // Helper method for performance logging
  logPerformance(
    operation: string,
    durationMs: number,
    metadata?: Record<string, any>,
  ) {
    this.logger.debug(`${operation} completed`, {
      context: this.context,
      duration_ms: durationMs,
      ...metadata,
    });
  }

  // Helper method for tracking API calls
  logApiCall(
    method: string,
    path: string,
    statusCode: number,
    durationMs: number,
  ) {
    this.logger.info(`API ${method} ${path}`, {
      context: this.context || 'API',
      method,
      path,
      status: statusCode,
      duration_ms: durationMs,
    });
  }

  // Helper for tracking database operations
  logDbOperation(
    operation: string,
    collection: string,
    filter: any,
    durationMs: number,
  ) {
    this.logger.debug(`DB ${operation}`, {
      context: this.context || 'Database',
      collection,
      filter: JSON.stringify(filter),
      duration_ms: durationMs,
    });
  }
}
