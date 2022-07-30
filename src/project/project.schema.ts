import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ default: 'test' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ default: [] })
  @IsOptional()
  users: string[];
}
