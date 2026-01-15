import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { AdminGuard } from 'src/auth/admin.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async getMetrics() {
    return this.metricsService.getMetrics();
  }
}
