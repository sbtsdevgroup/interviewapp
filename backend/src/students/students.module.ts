import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [AuthModule, NotificationsModule, LoggerModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}

