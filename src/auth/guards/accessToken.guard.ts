import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const req: Request = context.switchToHttp().getRequest();
      const res: Response = context.switchToHttp().getResponse();

      // Get and check if access token exists
      const accessToken = req.headers['authorization'].split(' ')[1];
      if (!accessToken) {
        throw new HttpException('No access token!', HttpStatus.UNAUTHORIZED);
      }

      // Verify access token validity
      const decoded = this.jwt.verify(accessToken);
      if (Date.now() >= decoded?.exp * 1000) {
        throw new HttpException('Token expired!', HttpStatus.UNAUTHORIZED);
      }

      res.locals.sub = decoded?.sub;
      return true;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        error?.message || 'Invalid token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
