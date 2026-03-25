import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StudentStatus } from '../enums/student-status.enum';

export class GetStudentsFilterDto {
  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    description: 'Filter by status (PENDING, APPROVED, etc.)',
    enum: StudentStatus,
    default: StudentStatus.ALL
  })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;
}
