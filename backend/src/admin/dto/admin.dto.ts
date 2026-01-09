import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;
}

