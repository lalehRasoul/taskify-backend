import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ default: 'test' })
  @IsNotEmpty()
  name: string;
}
