import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto, LoginDto } from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createUser(newUser: CreateUserDto): Promise<User> {
    newUser.password = await bcrypt.hash(newUser.password, 8);
    const user = await this.usersRepository.create(newUser);
    await this.usersRepository.save(user);
    return user;
  }

  async findUserByUsernameOrEmail(
    username?: string | null,
    email?: string | undefined,
  ): Promise<User> {
    if (!!username) {
      return this.usersRepository.findOneBy({ username });
    } else if (!!email) {
      return this.usersRepository.findOneBy({ email });
    }
    return null;
  }

  async findUserByCredentials(user: LoginDto): Promise<User> {
    let targetUser = await this.usersRepository.findOneBy({
      username: user.credential,
    });
    if (!targetUser) {
      targetUser = await this.usersRepository.findOneBy({
        email: user.credential,
      });
    }
    if (!!targetUser) {
      const isMatch = await bcrypt.compare(user.password, targetUser.password);
      if (!isMatch) return null;
      return targetUser;
    } else {
      return null;
    }
  }
}
