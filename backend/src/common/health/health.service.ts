import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  async checkHealth(): Promise<any> {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
    };

    return health;
  }

  async checkReadiness(): Promise<any> {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  async checkLiveness(): Promise<any> {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
