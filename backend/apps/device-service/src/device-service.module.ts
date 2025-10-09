import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { DeviceModule } from './device/device.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath: ['apps/device-service/.env'],
    }),
    DeviceModule,
    AuthModule,
  ],
})
export class DeviceServiceModule {}
