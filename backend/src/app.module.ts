import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { InterviewsModule } from './interviews/interviews.module';
import { AiModule } from './ai/ai.module';
import { WebRTCModule } from './webrtc/webrtc.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AppController } from './app.controller';
import { AdminModule } from './admin/admin.module';
import { WinstonLoggerService } from './common/logger/logger.service';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import { MonitoringModule } from './common/monitoring/monitoring.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    DatabaseModule,
    AuthModule,
    StudentsModule,
    InterviewsModule,
    AiModule,
    WebRTCModule,
    NotificationsModule,
    AdminModule,
    MonitoringModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    WinstonLoggerService,
    RequestLoggingMiddleware,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}

