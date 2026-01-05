import { IsString, IsOptional, IsObject, IsNumber, IsDateString } from 'class-validator';

export class CreateInterviewDto {
  @IsString()
  fullName: string;

  @IsString()
  @IsOptional()
  agentName?: string;

  @IsDateString()
  @IsOptional()
  interviewDate?: string;

  @IsString()
  @IsOptional()
  interviewer?: string;

  @IsString()
  @IsOptional()
  track?: string;

  @IsObject()
  @IsOptional()
  values?: Record<string, any>;
}

