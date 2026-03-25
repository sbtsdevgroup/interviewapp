import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class EvaluateAnswerDto {
  @ApiProperty({ description: 'The ID of the interview session' })
  @IsNumber()
  interviewId: number;

  @ApiProperty({ description: 'The unique ID/String of the question' })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ description: 'The student\'s answer text' })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({ description: 'The scoring criteria for this question' })
  @IsString()
  @IsNotEmpty()
  criteria: string;
}
