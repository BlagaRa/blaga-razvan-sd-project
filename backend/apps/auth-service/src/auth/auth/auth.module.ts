// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtGuard } from './guard/jwt.guard';
import { AdminGuard } from './guard';

@Module({
  imports: [PassportModule],
  providers: [JwtStrategy, JwtGuard,AdminGuard],
  exports: [PassportModule, JwtGuard,AdminGuard], 
})
export class AuthModule {}
