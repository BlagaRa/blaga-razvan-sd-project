import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;


    if (!authHeader?.startsWith('Bearer ')) {
      throw new ForbiddenException('Token lipsă sau invalid.');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = this.jwt.verify(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });


      if (!payload.isAdmin) {
        throw new ForbiddenException('Acces interzis: nu ești administrator.');
      }

      return true; 
    } catch(error) {
      if(error instanceof ForbiddenException){
        throw error;
      }
        throw new InternalServerErrorException("Eroare la server!")
      
    }
  }
}
