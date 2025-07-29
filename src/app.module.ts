import 'dotenv/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AppLoggerModule } from './shared/logger/app-logger.module';
import { RateLimiterMiddleware } from './shared/middleware/rate-limiter.middleware';
import { HttpLoggerMiddleware } from './shared/middleware/http-logger.middleware';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AppLoggerModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimiterMiddleware, HttpLoggerMiddleware).forRoutes('*');
  }
}
