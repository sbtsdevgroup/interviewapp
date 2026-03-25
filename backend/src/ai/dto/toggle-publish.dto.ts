import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class TogglePublishDto {
  @ApiProperty({ description: 'Whether to publish or unpublish the question' })
  @IsBoolean()
  @IsNotEmpty()
  publish: boolean;
}
