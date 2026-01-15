import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { DatabaseModule } from '../database/database.module';
import { WinstonLoggerService } from 'src/common/logger/logger.service';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, WinstonLoggerService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

