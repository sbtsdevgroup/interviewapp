import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { InterviewsModule } from './interviews/interviews.module';
import { AiModule } from './ai/ai.module';
import { WebRTCModule } from './webrtc/webrtc.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    StudentsModule,
    InterviewsModule,
    AiModule,
    WebRTCModule,
    NotificationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

