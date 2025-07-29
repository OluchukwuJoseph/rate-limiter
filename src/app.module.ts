import 'dotenv/config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AppLoggerModule } from './database/shared/logger/app-logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AppLoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
