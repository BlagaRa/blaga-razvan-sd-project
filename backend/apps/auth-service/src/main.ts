import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Acceptă atât http://localhost (Caddy) cât și http://localhost:3000 (direct)
  app.enableCors({
    origin: ['http://localhost', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // pune true doar dacă folosești cookie-uri
  });

  await app.listen(3001, '0.0.0.0');
}
bootstrap();
