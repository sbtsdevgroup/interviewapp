import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StudentStatus } from '../enums/student-status.enum';

export class GetStudentsFilterDto {
  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by status (pending, scheduled, completed)'
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by payment status (paid, pending)' })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiPropertyOptional({ description: 'Filter by assessment status (completed, pending)' })
  @IsOptional()
  @IsString()
  assessmentStatus?: string;

  @ApiPropertyOptional({ description: 'Filter by program track' })
  @IsOptional()
  @IsString()
  track?: string;

  @ApiPropertyOptional({ description: 'Filter by cohort' })
  @IsOptional()
  @IsString()
  cohort?: string;
}
