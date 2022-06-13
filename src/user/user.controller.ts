import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { UserService } from './user.service';

@UseGuards(AccessTokenGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('getSelfData')
  async getSelfData(@Res({ passthrough: true }) res: Response) {
    return this.userService.getSelfData(res);
  }

  @Get('getUserData/:userId')
  async getUserData(@Param('userId') userId: string) {
    return this.userService.getUserData(userId);
  }
}
