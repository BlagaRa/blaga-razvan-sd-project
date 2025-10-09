// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtGuard } from './guard/jwt.guard';
import { AdminGuard } from './guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PassportModule,JwtModule.register({}),],
  providers: [JwtStrategy, JwtGuard,AdminGuard],
  exports: [PassportModule, JwtGuard,AdminGuard], 
})
export class AuthModule {}
