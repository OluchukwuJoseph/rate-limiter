import 'dotenv/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AppLoggerModule } from './shared/logger/app-logger.module';
import { RateLimiterMiddleware } from './shared/middleware/rate-limiter.middleware';
import { HttpLoggerMiddleware } from './shared/middleware/http-logger.middleware';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { UserRateLimiterInterceptor } from './shared/interceptors/user-rate-limiter.interceptor';
import { BookModule } from './book/book.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AppLoggerModule,
    UserModule,
    AuthModule,
    BookModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserRateLimiterInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimiterMiddleware, HttpLoggerMiddleware).forRoutes('*');
  }
}
