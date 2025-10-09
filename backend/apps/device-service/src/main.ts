import { NestFactory } from '@nestjs/core';
import { DeviceServiceModule } from './device-service.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(DeviceServiceModule);
  app.useGlobalPipes(new ValidationPipe({
      whitelist:true
    }))
  await app.listen(3002);
}
bootstrap();
