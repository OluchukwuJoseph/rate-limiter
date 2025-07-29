import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppLoggerService } from '../logger/app-logger.service';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLoggerService) {
    this.logger.setContext('HTTP');
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const start = Date.now();

    // Log request on start
    this.logger.debug(`Incoming request ${method} ${originalUrl}`, null, {
      ip,
      userAgent,
    });

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;

      // Log at appropriate level based on status code
      if (statusCode >= 500) {
        this.logger.error(
          `Response ${statusCode} ${method} ${originalUrl}`,
          null,
          null,
          {
            duration,
            statusCode,
          },
        );
      } else if (statusCode >= 400) {
        this.logger.warn(
          `Response ${statusCode} ${method} ${originalUrl}`,
          null,
          {
            duration,
            statusCode,
          },
        );
      } else {
        this.logger.logApiCall(method, originalUrl, statusCode, duration);
      }
    });

    next();
  }
}
