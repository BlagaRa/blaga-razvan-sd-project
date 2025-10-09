// src/user-service.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
       isGlobal: true,
       envFilePath: ['apps/user-service/.env'], 
    }),
    PrismaModule,
    AuthModule,
    ProfileModule,
  ],
})
export class UserServiceModule {}
