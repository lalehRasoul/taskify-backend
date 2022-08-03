import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { User } from './user.entity';

export class CreateUserDto {
  @ApiProperty({ default: 'test' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ default: 'test@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ default: 'test123' })
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty()
  password: string;
}

export class UpdateUserDto {
  @ApiProperty({ default: 'test' })
  @IsOptional()
  username: string;

  @ApiProperty({ default: 'test@gmail.com' })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ default: 'test123' })
  @Exclude({ toPlainOnly: true })
  @IsOptional()
  password: string;
}

export class LoginDto {
  @ApiProperty({ default: 'test', description: 'username or email' })
  @IsNotEmpty()
  credential: string;

  @ApiProperty({ default: 'test123' })
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty()
  password: string;
}

export class RecoveryEmailDto {
  @ApiProperty({ default: 'test@gmail.com', description: 'email address' })
  @IsEmail()
  @IsNotEmpty()
  credential: string;
}

export class ChangePasswordByRecoveryMailDto {
  @ApiProperty({ default: 'test123', description: 'password' })
  @IsNotEmpty()
  password: string;
}

export class UserPayload {
  id: number;

  password: string;
}

export class UserContext {
  user: User;
}
