import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'The unique application ID of the student' })
  @IsNotEmpty()
  @IsString()
  applicationId: string;

  @ApiProperty({ description: 'Optional password for authentication', required: false })
  @IsOptional()
  @IsString()
  password?: string;
}

