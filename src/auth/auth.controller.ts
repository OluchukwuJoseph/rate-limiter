import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { plainToClass } from 'class-transformer';
import { LocalAuthGuard } from './guards/local.guard';
import { SerializedUser } from '../shared/serializers/user.serializer';
import { ExtendedRequest } from '../shared/interfaces/request.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.signup(createUserDto);

    return {
      message: 'ACCOUNT CREATED',
      user: plainToClass(SerializedUser, user, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async signin(@Request() req: ExtendedRequest) {
    const token = this.authService.signin(req.user);

    return {
      message: 'LOGIN SUCCESS',
      token,
    };
  }
}
