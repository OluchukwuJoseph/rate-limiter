import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ExtendedRequest } from '../shared/interfaces/request.interface';
import { plainToClass } from 'class-transformer';
import { SerializedUser } from '../shared/serializers/user.serializer';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('users')
export class UserController {
  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@Request() req: ExtendedRequest) {
    return {
      message: 'THE LOGGED IN USER',
      user: plainToClass(SerializedUser, req.user, {
        excludeExtraneousValues: true,
      }),
    };
  }
}
