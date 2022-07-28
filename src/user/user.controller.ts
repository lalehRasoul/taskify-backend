import {
  ClassSerializerInterceptor,
  Controller,
  Req,
  UseInterceptors,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserContext } from './user.schema';
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
  async profile(@Req() req: UserContext): Promise<any> {
    return req.user;
  }

  @ApiTags('user')
  @ApiResponse({
    status: 200,
    description: 'Returns all users.',
  })
  @Get('all')
  async allUsers(@Req() req: UserContext): Promise<any> {
    return this.userService.findAllUsers(req.user.id);
  }
}
