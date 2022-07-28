import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { config } from 'src/constants';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { UserPayload } from 'src/user/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.SECRET,
    });
  }

  async validate(payload: UserPayload): Promise<User> {
    const user: User = await this.userService.findUserById(payload.id);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
