import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from './user.entity';
import {
  CreateUserDto,
  LoginDto,
  RecoveryEmailDto,
  UpdateUserDto,
} from './user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createUser(newUser: CreateUserDto): Promise<User> {
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

  async findUserByCredentials(
    user: LoginDto | RecoveryEmailDto,
  ): Promise<User> {
    let targetUser = await this.usersRepository.findOneBy({
      username: user.credential,
    });
    if (!targetUser) {
      targetUser = await this.usersRepository.findOneBy({
        email: user.credential,
      });
    }
    if (user instanceof LoginDto) {
      if (!!targetUser) {
        const isMatch = await bcrypt.compare(
          user.password,
          targetUser.password,
        );
        if (!isMatch) return null;
        return targetUser;
      } else {
        return null;
      }
    } else {
      return targetUser;
    }
  }

  async findUserById(id: number): Promise<User> {
    return this.usersRepository.findOneBy({ id });
  }

  async findAllUsers(id: number) {
    const where = { id: Not(id) };
    if (!id) delete where.id;
    return this.usersRepository.find({ where });
  }

  async updateUser(user: User, newInfo: UpdateUserDto): Promise<User> {
    if (!!newInfo.username) {
      user.username = newInfo.username;
    }
    if (!!newInfo.email) {
      user.email = newInfo.email;
    }
    if (!!newInfo.password) {
      const isMatch = await bcrypt.compare(user.password, newInfo.password);
      if (!isMatch) {
        delete user.password;
        user.password = await bcrypt.hash(newInfo.password, 10);
      }
    }
    await this.usersRepository.save(user);
    return user;
  }

  async deleteAccount(user: User): Promise<void> {
    await this.usersRepository.remove(user);
  }
}
