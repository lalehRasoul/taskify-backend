import {
  ClassSerializerInterceptor,
  Controller,
  Req,
  UseInterceptors,
  Get,
  UseGuards,
  Put,
  Body,
  ConflictException,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { messages } from 'src/constants';
import { User } from './user.entity';
import { UpdateUserDto, UserContext } from './user.schema';
import { UserService } from './user.service';

@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiResponse({
  status: 401,
  description: 'Unauthorized',
})
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiTags('user')
  @ApiResponse({
    status: 200,
    description: 'Returns user info.',
  })
  @Get()
  async profile(@Req() req: UserContext): Promise<User> {
    return req.user;
  }

  @ApiTags('user')
  @ApiResponse({
    status: 200,
    description: 'Returns all users.',
  })
  @Get('all')
  async allUsers(@Req() req: UserContext): Promise<User[]> {
    return this.userService.findAllUsers(req.user.id);
  }

  @ApiTags('user')
  @ApiResponse({
    status: 200,
    description: 'The user account has been successfully deleted.',
  })
  @Delete()
  async deleteAccount(@Req() req: UserContext): Promise<void> {
    this.userService.deleteAccount(req.user);
  }

  @ApiTags('user')
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exist.',
  })
  @Put()
  async updateProfile(
    @Req() req: UserContext,
    @Body() newInfo: UpdateUserDto,
  ): Promise<User> {
    let user: User = await this.userService.findUserByUsernameOrEmail(
      newInfo.username,
    );
    if (user !== null && user.id !== req.user.id) {
      throw new ConflictException(messages.userExist);
    }
    user = await this.userService.findUserByUsernameOrEmail(
      null,
      newInfo.email,
    );
    if (user !== null && user.id !== req.user.id) {
      throw new ConflictException(messages.userExist);
    }
    this.userService.updateUser(req.user, newInfo);
    return req.user;
  }
}
