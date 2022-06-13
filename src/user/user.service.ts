import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getSelfData(res: Response) {
    const userId = res.locals.sub;

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new HttpException('Could not get data!', HttpStatus.NOT_FOUND);
    }

    return { userData: user };
  }

  async getUserData(userId: string) {
    const userData = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!userData) {
      throw new HttpException('Could not find user!', HttpStatus.NOT_FOUND);
    }

    return { userData };
  }
}
