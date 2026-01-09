import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsNumber, IsDateString } from 'class-validator';

export class UpdateInterviewDto {
  @ApiPropertyOptional({ description: 'Full name of the student' })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Agent name' })
  @IsString()
  @IsOptional()
  agentName?: string;

  @ApiPropertyOptional({ description: 'Date and time of the interview' })
  @IsDateString()
  @IsOptional()
  interviewDate?: string;

  @ApiPropertyOptional({ description: 'Name of interviewer' })
  @IsString()
  @IsOptional()
  interviewer?: string;

  @ApiPropertyOptional({ description: 'Track chosen for interview' })
  @IsString()
  @IsOptional()
  track?: string;

  @ApiPropertyOptional({ description: 'Values: {}' })
  @IsObject()
  @IsOptional()
  values?: Record<string, any>;
}

