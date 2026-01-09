import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsNumber, IsDateString } from 'class-validator';

export class CreateInterviewDto {
  @ApiProperty({ description: 'Full name of the student' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Agent name' })
  @IsString()
  @IsOptional()
  agentName?: string;

  @ApiProperty({ description: 'Date and time of the interview' })
  @IsDateString()
  @IsOptional()
  interviewDate?: string;

  @ApiProperty({ description: 'Name of interviewer' })
  @IsString()
  @IsOptional()
  interviewer?: string;

  @ApiProperty({ description: 'Track chosen for interview' })
  @IsString()
  @IsOptional()
  track?: string;

  @ApiProperty({ description: 'Values: {}' })
  @IsObject()
  @IsOptional()
  values?: Record<string, any>;
}

