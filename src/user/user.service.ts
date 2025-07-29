import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import CryptoHelper from '../shared/utils/cryptoHelper';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findUserByEmail(email: string, throwError = true) {
    const user = await this.userModel.findOne({ email });

    if (throwError && !user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createUser(createUserDto: CreateUserDto) {
    const user = new this.userModel(createUserDto);
    user.password = CryptoHelper.generateHash(createUserDto.password);
    await user.save();

    return user;
  }
}
