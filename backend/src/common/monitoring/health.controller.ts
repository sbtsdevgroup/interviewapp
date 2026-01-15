import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { WinstonLoggerService } from '../logger/logger.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private readonly logger: WinstonLoggerService,
  ) {}

  // @Get()
  // @HealthCheck()
  // async check() {
  //   const result = await this.health.check([
  //     () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
  //     () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024), // 300MB
  //     () =>
  //       this.disk.checkStorage('storage', {
  //         path: process.cwd(),
  //         thresholdPercent: 0.9,
  //       }),
  //   ]);

  //   // Log health check result
  //   this.logger.debug('Health check performed', 'HealthController');

  //   return result;
  // }

  @Get('detailed')
  @HealthCheck()
  async detailedCheck() {
    const startTime = Date.now();

    const result = await this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
      () =>
        this.disk.checkStorage('storage', {
          path: process.cwd(),
          thresholdPercent: 0.9,
        }),
    ]);

    const duration = Date.now() - startTime;

    // Log detailed health check
    this.logger.logBusinessEvent('health_check_detailed', {
      duration: `${duration}ms`,
      status: result.status,
      details: result.details,
    });

    return {
      ...result,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.version,
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
