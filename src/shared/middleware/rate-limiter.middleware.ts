import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { NextFunction, Request, Response } from 'express';
import { IpHelper } from '../utils/ip';
import { UNKNOWN_IP_ADDRESS } from '../constants/ip';
import { RateLimitConfig } from '../interfaces/rate-limit-config.interface';
import {
  DEFAULT_RATE_LIMITS,
  RATE_LIMIT_LUA_SCRIPT,
  REDIS_KEY_PREFIXES,
} from '../constants/rate-limit';
import { buildRedisKey } from '../utils/redisHelper';

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private readonly rateLimitConfig: RateLimitConfig;
  private readonly logger = new Logger(RateLimiterMiddleware.name);

  constructor(@InjectRedis() private readonly redis: Redis) {
    this.rateLimitConfig = this.validateAndParseConfig();
  }

  private validateAndParseConfig(): RateLimitConfig {
    const requestLimit = parseInt(
      process.env.REQUEST_LIMIT || DEFAULT_RATE_LIMITS.IP.REQUEST_LIMIT,
      10,
    );
    const windowDurationInSeconds = parseInt(
      process.env.RATE_LIMIT_WINDOW_SECONDS ||
        DEFAULT_RATE_LIMITS.IP.WINDOW_DURATION_SECONDS,
      10,
    );

    if (isNaN(requestLimit) || requestLimit <= 0) {
      throw new Error('REQUEST_LIMIT must be a positive integer');
    }

    if (isNaN(windowDurationInSeconds) || windowDurationInSeconds <= 0) {
      throw new Error('RATE_LIMIT_WINDOW_SECONDS must be a positive integer');
    }

    return { requestLimit, windowDurationInSeconds };
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const clientIpAddress = IpHelper.getClientIP(req);

      // Reject requests where IP cannot be determined (security measure)
      if (clientIpAddress === UNKNOWN_IP_ADDRESS) {
        throw new BadRequestException('Unable to determine client IP address');
      }

      // Check if the request is within rate limits
      const isRequestAllowed = await this.checkRateLimit(clientIpAddress);

      if (!isRequestAllowed) {
        this.logger.warn(`Rate limit exceeded for IP: ${clientIpAddress}`, {
          ipAddress: clientIpAddress,
          userAgent: req.get('User-Agent') || 'Unknown',
          requestPath: req.url,
          requestMethod: req.method,
          timestamp: new Date().toISOString(),
          rateLimitConfig: {
            limit: this.rateLimitConfig.requestLimit,
            windowSeconds: this.rateLimitConfig.windowDurationInSeconds,
          },
        });

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `Rate limit exceeded. Maximum ${this.rateLimitConfig.requestLimit} requests per ${this.rateLimitConfig.windowDurationInSeconds} seconds allowed.`,
            error: 'Too Many Requests',
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof HttpException
      ) {
        throw error;
      }
      // Fail open - allow request if rate limiter fails
      this.logger.error('Rate limiter error:', error);
    }

    next();
  }

  private async checkRateLimit(ipAddress: string) {
    const redisKey = buildRedisKey(REDIS_KEY_PREFIXES.IP_RATE_LIMIT, ipAddress);

    try {
      // atomic Lua script to prevent race conditions
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
        `Redis operation failed for IP ${ipAddress}:`,
        redisError,
      );

      // Fail open - allow request if Redis is down
      return true;
    }
  }
}
