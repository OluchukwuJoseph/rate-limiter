import { NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('/api/v1', {
    exclude: [
      { path: '/', method: RequestMethod.GET },
      { path: '/api/v1', method: RequestMethod.GET },
    ],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
