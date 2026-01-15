import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WinstonLoggerService } from '../logger/logger.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: WinstonLoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const { method, originalUrl, ip } = req;
    const userId = (req as any).user?.id; // Assuming JWT user is attached

    // Log request start
    this.logger.debug(`Request started: ${method} ${originalUrl}`, 'RequestLoggingMiddleware');

    // Listen for response finish event
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Log request completion
      this.logger.logRequest(method, originalUrl, statusCode, duration, userId);
    });

    next();
  }
}
