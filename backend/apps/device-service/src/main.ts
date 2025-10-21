import { NestFactory } from '@nestjs/core';
import { DeviceServiceModule } from './device-service.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(DeviceServiceModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.enableCors({
    origin: ['http://localhost', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(3002, '0.0.0.0');
}
bootstrap();
