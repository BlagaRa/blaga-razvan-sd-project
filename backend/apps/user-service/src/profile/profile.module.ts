// src/profile/profile.module.ts
import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule,
     AuthModule,
     PrismaModule,
     JwtModule.register({}),
    ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
