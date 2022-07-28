import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

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

export class LoginDto {
  @ApiProperty({ default: 'test', description: 'username or email' })
  @IsNotEmpty()
  credential: string;

  @ApiProperty({ default: 'test123' })
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty()
  password: string;
}
