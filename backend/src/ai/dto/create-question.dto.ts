import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({ description: 'The text of the interview question' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ description: 'The scoring criteria for this question' })
  @IsString()
  @IsNotEmpty()
  criteria: string;
}
