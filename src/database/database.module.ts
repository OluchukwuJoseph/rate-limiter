import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import mongoConfig from './config/mongoConfig';
import redisConfig from './config/redisConfig';

@Module({
  imports: [
    MongooseModule.forRoot(mongoConfig.connection),
    RedisModule.forRoot({ type: 'single', url: redisConfig.connection }),
  ],
})
export class DatabaseModule {}
