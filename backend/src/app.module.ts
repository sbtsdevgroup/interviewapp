import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { SourceApiModule } from './source-api/source-api.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { InterviewsModule } from './interviews/interviews.module';
import { AiModule } from './ai/ai.module';
import { WebRTCModule } from './webrtc/webrtc.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AppController } from './app.controller';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    SourceApiModule,
    AuthModule,
    StudentsModule,
    InterviewsModule,
    AiModule,
    WebRTCModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}

