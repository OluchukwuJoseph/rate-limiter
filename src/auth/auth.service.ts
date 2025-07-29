import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import CryptoHelper from '../shared/utils/cryptoHelper';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { UserDocument } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findUserByEmail(email, false);

    if (!user) {
      throw new UnauthorizedException('Incorrect email or password');
    }

    if (!CryptoHelper.compareHash(password, user.password)) {
      throw new UnauthorizedException('Password is incorrect');
    }

    return user;
  }

  async signup(createUserDto: CreateUserDto) {
    const userExists = await this.userService.findUserByEmail(
      createUserDto.email,
      false,
    );

    if (userExists) {
      throw new ConflictException(
        'Email address is already registered. Log in instead.',
      );
    }

    const user = await this.userService.createUser(createUserDto);

    return user;
  }

  signin(user: UserDocument) {
    const { _id, email } = user;
    const payload = { _id, email };
    const token = this.jwtService.sign(payload);

    return token;
  }
}
