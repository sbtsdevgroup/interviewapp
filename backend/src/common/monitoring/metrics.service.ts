import { Injectable } from '@nestjs/common';
import { register, collectDefaultMetrics, Gauge, Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
  private httpRequestTotal: Counter<string>;
  private httpRequestDuration: Histogram<string>;
  private activeConnections: Gauge<string>;
  private businessEventsTotal: Counter<string>;

  constructor() {
    // Enable default metrics collection (CPU, memory, etc.)
    collectDefaultMetrics();

    // HTTP request metrics
    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5, 10],
    });

    // Active connections gauge
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
    });

    // Business events counter
    this.businessEventsTotal = new Counter({
      name: 'business_events_total',
      help: 'Total number of business events',
      labelNames: ['event_type', 'user_type'],
    });
  }

  // Increment HTTP request counter
  incrementHttpRequests(method: string, route: string, statusCode: number) {
    this.httpRequestTotal.inc({ method, route, status_code: statusCode.toString() });
  }

  // Record HTTP request duration
  recordHttpRequestDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.observe({ method, route }, duration / 1000); // Convert to seconds
  }

  // Update active connections
  setActiveConnections(count: number) {
    this.activeConnections.set(count);
  }

  // Increment business events
  incrementBusinessEvents(eventType: string, userType?: string) {
    this.businessEventsTotal.inc({ event_type: eventType, user_type: userType || 'unknown' });
  }

  // Get metrics in Prometheus format
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  // Get registry for advanced operations
  getRegistry() {
    return register;
  }
}
