import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
    @ApiProperty({ description: 'ID of the user to whom the notification is addressed' })
    @IsString()
    userId: string;

    @ApiProperty({ description: 'Type of the user (e.g., student, admin)' })
    @IsString()
    userType: string;

    @ApiProperty({ description: 'Title of the notification' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Content of the notification' })
    @IsString()
    message: string;

    @ApiProperty({ description: 'Type of notification (e.g., info, warning, alert)' })
    @IsString()
    @IsOptional()
    type?: string;

    @ApiProperty({ description: 'Related entity type (e.g., interview, assignment)' })
    @IsString()
    @IsOptional()
    relatedEntityType?: string;

    @ApiProperty({ description: 'ID of the related entity' })
    @IsString()
    @IsOptional()
    relatedEntityId?: string;
}