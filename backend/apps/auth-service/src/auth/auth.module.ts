// src/auth/auth.module.ts
import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtModule } from "@nestjs/jwt";
import { RedisModule } from "./redis/redis.module";

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({}),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
