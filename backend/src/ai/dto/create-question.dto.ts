import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({ description: 'The text of the interview question' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ description: 'The type of the question (e.g., long-text, single-choice)' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'The category of the question' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'The options for the question (if applicable)' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @ApiProperty({ description: 'The scoring criteria for this question' })
  @IsString()
  @IsNotEmpty()
  criteria: string;
}
