import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
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
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exist.',
  })
  @HttpCode(201)
  @Post('signup')
  async signup(@Body() newUser: CreateUserDto): Promise<any> {
    let user: User = await this.userService.findUserByUsernameOrEmail(
      newUser.username,
    );
    if (user !== null) throw new ConflictException(messages.userExist);
    user = await this.userService.findUserByUsernameOrEmail(
      null,
      newUser.email,
    );
    if (user !== null) throw new ConflictException(messages.userExist);
    const createdUser: User = await this.userService.createUser(newUser);
    return {
      user: createdUser,
      access_token: await this.authService.login(createdUser),
    };
  }

  @ApiTags('auth')
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged in.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @Post('signin')
  async signin(@Body() user: LoginDto): Promise<any> {
    const targetUser: User = await this.userService.findUserByCredentials(user);
    if (targetUser === null) throw new NotFoundException(messages.userNotFound);
    return {
      user: targetUser,
      access_token: await this.authService.login(targetUser),
    };
  }
}
