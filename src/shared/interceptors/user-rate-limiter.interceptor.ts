import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { RateLimitConfig } from '../interfaces/rate-limit-config.interface';
import {
  DEFAULT_RATE_LIMITS,
  RATE_LIMIT_LUA_SCRIPT,
  REDIS_KEY_PREFIXES,
} from '../constants/rate-limit';
import { buildRedisKey } from '../utils/redisHelper';

@Injectable()
export class UserRateLimiterInterceptor implements NestInterceptor {
  private readonly rateLimitConfig: RateLimitConfig;
  private readonly logger = new Logger(UserRateLimiterInterceptor.name);

  constructor(@InjectRedis() private readonly redis: Redis) {
    this.rateLimitConfig = this.validateAndParseConfig();
  }

  private validateAndParseConfig(): RateLimitConfig {
    const requestLimit = parseInt(
      process.env.USER_REQUEST_LIMIT || DEFAULT_RATE_LIMITS.USER.REQUEST_LIMIT,
      10,
    );
    const windowDurationInSeconds = parseInt(
      process.env.USER_RATE_LIMIT_WINDOW_SECONDS ||
        DEFAULT_RATE_LIMITS.USER.WINDOW_DURATION_SECONDS,
      10,
    );

    if (isNaN(requestLimit) || requestLimit <= 0) {
      throw new Error('USER_REQUEST_LIMIT must be a positive integer');
    }

    if (isNaN(windowDurationInSeconds) || windowDurationInSeconds <= 0) {
      throw new Error(
        'USER_RATE_LIMIT_WINDOW_SECONDS must be a positive integer',
      );
    }

    return { requestLimit, windowDurationInSeconds };
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    // Skip rate limiting if user is not authenticated
    if (!request.user || !request.user.id) {
      return next.handle();
    }

    const userId = request.user.id;

    try {
      const isRequestAllowed = await this.checkUserRateLimit(userId);

      if (!isRequestAllowed) {
        this.logger.warn(`User rate limit exceeded for user ID: ${userId}`, {
          userId,
          userEmail: request.user.email || 'Unknown',
          requestPath: request.url,
          requestMethod: request.method,
          timestamp: new Date().toISOString(),
          rateLimitConfig: {
            limit: this.rateLimitConfig.requestLimit,
            windowSeconds: this.rateLimitConfig.windowDurationInSeconds,
          },
        });

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `User rate limit exceeded. Maximum ${this.rateLimitConfig.requestLimit} requests per ${this.rateLimitConfig.windowDurationInSeconds} seconds allowed.`,
            error: 'Too Many Requests',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`User rate limiter error for user ${userId}:`, error);
    }

    return next.handle();
  }

  private async checkUserRateLimit(userId: string): Promise<boolean> {
    const redisKey = buildRedisKey(REDIS_KEY_PREFIXES.USER_RATE_LIMIT, userId);

    try {
      // Atomic Lua script to prevent race conditions
      const result = (await this.redis.eval(
        RATE_LIMIT_LUA_SCRIPT,
        1,
        redisKey,
        this.rateLimitConfig.requestLimit.toString(),
        this.rateLimitConfig.windowDurationInSeconds.toString(),
      )) as number;

      return result === 1;
    } catch (redisError) {
      this.logger.error(
        `Redis operation failed for user ${userId}:`,
        redisError,
      );

      // Fail open - allow request if Redis is down
      return true;
    }
  }
}
