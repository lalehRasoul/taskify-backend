import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  NotFoundException,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { messages } from 'src/constants';
import { User } from 'src/user/user.entity';
import { CreateUserDto, LoginDto } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @ApiTags('auth')
  @Post('signup')
  async signup(
    @Body() newUser: CreateUserDto,
  ): Promise<{ user: User; access_token: string }> {
    const user: User = await this.userService.findUserByUsernameOrEmail(
      newUser.username,
    );
    if (user !== null) throw new ConflictException(messages.userExist);
    const createdUser: User = await this.userService.createUser(newUser);
    return {
      user: createdUser,
      access_token: await this.authService.login(createdUser),
    };
  }

  @ApiTags('auth')
  @Post('signin')
  async signin(
    @Body() user: LoginDto,
  ): Promise<{ user: User; access_token: string }> {
    const targetUser: User = await this.userService.findUserByCredentials(user);
    if (targetUser === null) throw new NotFoundException(messages.userNotFound);
    return {
      user: targetUser,
      access_token: await this.authService.login(targetUser),
    };
  }
}
