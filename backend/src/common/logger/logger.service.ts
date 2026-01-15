import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: { service: 'interviewapp-backend' },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),

        // File transport for all logs
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          zippedArchive: true,
        }),

        // Separate file for errors
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '30d',
          zippedArchive: true,
        }),

        // Separate file for database operations
        new DailyRotateFile({
          filename: 'logs/database-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'debug',
          maxSize: '20m',
          maxFiles: '7d',
          zippedArchive: true,
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  // Custom methods for specific use cases
  logRequest(method: string, url: string, statusCode: number, responseTime: number, userId?: string) {
    this.logger.info('HTTP Request', {
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      userId,
      type: 'request',
    });
  }

  logDatabase(operation: string, table: string, duration: number, success: boolean, error?: string) {
    this.logger.info('Database Operation', {
      operation,
      table,
      duration: `${duration}ms`,
      success,
      error,
      type: 'database',
    });
  }

  logAuth(action: string, success: boolean, userId?: string, ip?: string) {
    this.logger.info('Authentication Event', {
      action,
      userId,
      ip,
      success,
      type: 'auth',
    });
  }

  logBusinessEvent(event: string, data: any, userId?: string) {
    this.logger.info('Business Event', {
      event,
      data,
      userId,
      type: 'business',
    });
  }
}
