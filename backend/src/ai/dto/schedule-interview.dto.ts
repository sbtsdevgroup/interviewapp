import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ScheduleInterviewDto {
  @ApiProperty({ description: 'The ID of the student' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'The scheduled date/time' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Specific instructions for the interview' })
  @IsString()
  @IsNotEmpty()
  instructions: string;
}
