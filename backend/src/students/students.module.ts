import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AuthModule, NotificationsModule, AiModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}

