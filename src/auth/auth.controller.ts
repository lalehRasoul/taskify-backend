import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  forwardRef,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { config, messages } from 'src/constants';
import { User } from 'src/user/user.entity';
import {
  ChangePasswordByRecoveryMailDto,
  CreateUserDto,
  LoginDto,
  RecoveryEmailDto,
  UpdateUserDto,
} from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import { EmailOptionsDto } from 'src/utils/utils.schema';
import { UtilsService } from 'src/utils/utils.service';
import { AuthService } from './auth.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private authService: AuthService,
    private utilsService: UtilsService,
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

  @ApiTags('auth')
  @ApiResponse({
    status: 200,
    description: 'The recovery email has been successfully sent.',
  })
  @Post('recovery')
  async sendRecoveryEmail(@Body() user: RecoveryEmailDto): Promise<null> {
    const targetUser: User = await this.userService.findUserByCredentials(user);
    if (targetUser === null) return null;
    const linkId: string = await this.utilsService.createRecoveryEmailLink(
      targetUser,
    );
    const emailOptions: EmailOptionsDto = new EmailOptionsDto();
    emailOptions.to = targetUser.email;
    emailOptions.html = this.utilsService.generateRecoveryEmailTemplate(
      `${config.NODE_MAILER.WEBSITE}/recovery/${linkId}`,
      targetUser.username,
    );
    await this.utilsService.sendEmail(emailOptions);
    return null;
  }

  @ApiTags('auth')
  @ApiResponse({
    status: 200,
    description: 'The password has been successfully updated.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @Post('recovery/:rcode')
  async submitPassword(
    @Body() user: ChangePasswordByRecoveryMailDto,
    @Param('rcode') rcode: string,
  ): Promise<null> {
    const userId: string = await this.utilsService.getIdByRCode(rcode);
    if (!userId) throw new NotFoundException(messages.userNotFound);
    const targetUser: User = await this.userService.findUserById(
      Number(userId),
    );
    if (targetUser === null) throw new NotFoundException(messages.userNotFound);
    await this.userService.updateUser(targetUser, {
      password: user.password,
    } as UpdateUserDto);
    await this.utilsService.deleteRcode(rcode);
    return null;
  }
}
