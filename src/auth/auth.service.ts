import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findUserByUsernameOrEmail(username);
    if (user && user.password === pass) {
      const result = { ...user };
      delete result.password;
      return result;
    }
    return null;
  }

  async login(user: User) {
    const payload = { username: user.username, id: user.id };
    return this.jwtService.sign(payload);
  }
}
