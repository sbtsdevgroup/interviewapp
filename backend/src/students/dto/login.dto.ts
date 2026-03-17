import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  applicationId: string;

  @IsOptional()
  @IsString()
  password?: string;
}

