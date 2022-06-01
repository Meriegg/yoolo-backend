import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './dto';
import * as argon from 'argon2';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  private generateAccessToken(userId: string) {
    const token = this.jwt.sign(
      { sub: userId, isRefresh: false },
      { expiresIn: '15min' },
    );

    return token;
  }

  private async generateAndUseRefreshToken(userId: string) {
    const token = this.jwt.sign(
      { sub: userId, isRefresh: true },
      { expiresIn: '14d' },
    );

    const hashedToken = await argon.hash(token);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: hashedToken,
      },
    });

    return token;
  }

  async register(body: RegisterDto) {
    const hashedPassword = await argon.hash(body.password);

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: body.email }, { username: body.username }],
      },
    });
    if (existingUser) {
      throw new HttpException('User already exists!', HttpStatus.BAD_REQUEST);
    }

    const newUser = await this.prisma.user.create({
      data: {
        email: body.email,
        username: body.username,
        password: hashedPassword,
      },
    });

    const accessToken = this.generateAccessToken(newUser.id);
    const refreshToken = await this.generateAndUseRefreshToken(newUser.id);

    return {
      userData: newUser,
      accessToken,
      refreshToken,
    };
  }

  async login(body: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (!user) {
      throw new HttpException('User does not exist!', HttpStatus.NOT_FOUND);
    }

    const doPasswordsMatch = await argon.verify(user.password, body.password);
    if (!doPasswordsMatch) {
      throw new HttpException('Incorrect Password!', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = await this.generateAndUseRefreshToken(user.id);

    return {
      userData: user,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(res: Response) {
    const userId = res.locals.sub;
    const newAccessToken = await this.generateAccessToken(userId);
    const newRefreshToken = await this.generateAndUseRefreshToken(userId);

    return { refreshToken: newRefreshToken, accessToken: newAccessToken };
  }
}
