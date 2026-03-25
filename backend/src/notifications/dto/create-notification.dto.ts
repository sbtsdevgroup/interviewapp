import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ description: 'The ID of the recipient user' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ enum: ['student', 'admin'], description: 'Type of the recipient user' })
  @IsEnum(['student', 'admin'])
  userType: 'student' | 'admin';

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Notification message body' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ required: false, description: 'Type of notification' })
  @IsOptional()
  @IsString()
  type?: string;
}
