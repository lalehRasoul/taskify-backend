import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class TaskDto {
  @ApiProperty({ default: 'test' })
  @IsNotEmpty()
  title: string;

  @ApiProperty({ default: 'test test test' })
  @IsNotEmpty()
  note: string;

  @ApiProperty({ default: false })
  @IsOptional()
  checked: boolean;
}
