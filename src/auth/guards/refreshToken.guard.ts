import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private jwt: JwtService, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req: Request = context.switchToHttp().getRequest();
      const res: Response = context.switchToHttp().getResponse();

      const refreshToken = req.headers?.refreshtoken;
      if (!refreshToken) {
        throw new HttpException('No Refresh Token!', HttpStatus.BAD_REQUEST);
      }

      const decoded = this.jwt.verify(refreshToken as string);

      if (Date.now() >= decoded?.exp * 1000) {
        throw new HttpException('Token expired!', HttpStatus.UNAUTHORIZED);
      }

      if (!decoded.isRefresh) {
        throw new HttpException('Invalid Token!', HttpStatus.UNAUTHORIZED);
      }

      const dbUser = await this.prisma.user.findUnique({
        where: {
          id: decoded.sub,
        },
      });
      if (!dbUser) {
        throw new HttpException(
          'Could not find user!',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Check if this refresh token is the same as the one in db
      const doTokensMatch = await argon.verify(
        dbUser.refreshToken,
        refreshToken as string,
      );
      if (!doTokensMatch) {
        throw new HttpException('Nice try', HttpStatus.UNAUTHORIZED);
      }

      res.locals.sub = decoded.sub;

      return true;
    } catch (error) {
      throw error;
    }
  }
}
