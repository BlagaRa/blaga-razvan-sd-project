import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import { AdminUpdateUserDto, LoginDto, SignupDto } from "./dto";
import * as argon from "argon2";
import { isEmail } from "class-validator";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "./redis/redis.service";
import { PrismaService } from "../prisma/prisma.service";
import * as nodemailer from "nodemailer";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    public jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,

  ) {}

  /** ========== 🔒 JWT helpers ========== */
  private async updateRefreshTokenHash(userId: number, refreshToken: string) {
    const hash = await argon.hash(refreshToken);
    const time = 7 * 24 * 60 * 60;
    await this.redis.set(`refresh_token:${userId}`, hash, time);
  }

  private async signEmailVerificationToken(userId: number, email: string) {
    return this.jwt.signAsync(
      { sub: userId, email },
      {
        secret: this.config.get("EMAIL_VERIFICATION_SECRET"),
        expiresIn: "1d",
      }
    );
  }

  /** ========== 📧 Email Setup ========== */
  

  /** ========== 👤 SIGNUP ========== */
  async signup(dto: SignupDto) {
    try {
      const existingEmail = await this.prisma.authUser.findUnique({ where: { email: dto.email } });
      if (existingEmail) throw new BadRequestException("Emailul exista deja");

      const existingUsername = await this.prisma.authUser.findUnique({ where: { username: dto.username } });
      if (existingUsername) throw new BadRequestException("Usernameul exista deja");

      if (dto.role === "ADMIN") throw new ForbiddenException("Nu ai dreptul!");

      const hashedPassword = await argon.hash(dto.password);
      const user = await this.prisma.authUser.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          username: dto.username,
          role: "USER",
        },
      });

      // Trimite email de verificare prin MailService

      return { message: "Account created! " };
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException("Eroare la server!");
    }
}

  /** ========== 📬 Verify Email ========== */
  async verifyEmail(token: string) {
    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get("EMAIL_VERIFICATION_SECRET"),
      });

      const user = await this.prisma.authUser.findUnique({ where: { id: payload.sub } });
      if (!user) throw new BadRequestException("User not found.");

      if (user.isEmailVerified) return { message: "Already verified." };

      await this.prisma.authUser.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      });

      return { message: "✅ Email verified successfully!" };
    } catch (error) {
      throw new ForbiddenException("Invalid or expired verification link.");
    }
  }

  /** ========== 🔁 Resend Email Verification ========== */
  

  /** ========== 🧠 Login ========== */
  async login(dto: LoginDto) {
    const raw = dto.identifier.trim();
    const where = isEmail(raw) ? { email: raw } : { username: raw };

    const user = await this.prisma.authUser.findUnique({ where });
    if (!user) throw new ForbiddenException("Credentiale incorecte");

    const valid = await argon.verify(user.password, dto.password);
    if (!valid) throw new ForbiddenException("Credentiale incorecte");

    if (user.isBanned) throw new UnauthorizedException("Esti banat!");

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(user.id, user.email, user.role === "ADMIN", user.username, user.isEmailVerified),
      this.refreshToken(user.id, user.email, user.role === "ADMIN", user.username, user.isEmailVerified),
    ]);

    await this.updateRefreshTokenHash(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  /** ========== 🔐 Token Generation ========== */
  async signToken(userId: number, email: string, isAdmin: boolean, username: string, isEmailVerified: boolean) {
    const payload = { sub: userId, email, isAdmin, username, isEmailVerified };
    const secret = this.config.get("JWT_SECRET");
    return this.jwt.signAsync(payload, { expiresIn: "15m", secret });
  }

  async refreshToken(userId: number, email: string, isAdmin: boolean, username: string, isEmailVerified: boolean) {
    const payload = { sub: userId, email, isAdmin, username, isEmailVerified };
    const secret = this.config.get("REFRESH_TOKEN");
    return this.jwt.signAsync(payload, { expiresIn: "7d", secret });
  }

  /** ========== 🧹 Admin tools & utils ========== */
  async logout(userId: number) {
    await this.redis.del(`refresh_token:${userId}`);
    return { message: "Logout successful" };
  }

  async updateAuthById(userIdToChange: number, dto: AdminUpdateUserDto) {
    const user = await this.prisma.authUser.findUnique({ where: { id: userIdToChange } });
    if (!user) throw new BadRequestException("Userul nu exista!");

    if (dto.email) {
      const existingEmail = await this.prisma.authUser.findUnique({ where: { email: dto.email } });
      if (existingEmail && existingEmail.id !== userIdToChange)
        throw new BadRequestException("Emailul exista deja!");
    }

    if (dto.username) {
      const existingUsername = await this.prisma.authUser.findUnique({ where: { username: dto.username } });
      if (existingUsername && existingUsername.id !== userIdToChange)
        throw new BadRequestException("Usernameul exista deja!");
    }

    return this.prisma.authUser.update({
      where: { id: userIdToChange },
      data: { ...dto },
    });
  }

  async getAllAuth() {
    return this.prisma.authUser.findMany({ orderBy: { id: "asc" } });
  }

  async getAuthById(userId: number) {
    const user = await this.prisma.authUser.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException("Userul nu exista!");
    return user;
  }

  /** ========== ♻️ Token refresh ========== */
  async newToken(userId: number, refreshToken: string) {
    const user = await this.prisma.authUser.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException("Access Denied");

    const storedHash = await this.redis.get(`refresh_token:${userId}`);
    if (!storedHash) throw new ForbiddenException("Access Denied");

    const hashesMatch = await argon.verify(storedHash, refreshToken);
    if (!hashesMatch) throw new ForbiddenException("Access Denied");

    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.signToken(user.id, user.email, user.role === "ADMIN", user.username, user.isEmailVerified),
      this.refreshToken(user.id, user.email, user.role === "ADMIN", user.username, user.isEmailVerified),
    ]);

    await this.updateRefreshTokenHash(user.id, newRefreshToken);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
