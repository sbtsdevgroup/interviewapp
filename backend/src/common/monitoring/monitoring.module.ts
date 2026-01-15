import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { HealthController } from './health.controller';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [TerminusModule, LoggerModule],
  controllers: [MetricsController, HealthController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MonitoringModule {}
