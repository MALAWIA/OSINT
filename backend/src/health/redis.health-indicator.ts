import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthCheckResult, HealthIndicatorFunction } from '@nestjs/terminus';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@InjectRedis() private readonly redis: Redis) {
    super();
  }

  async isHealthy(key: string): Promise<HealthCheckResult> {
    try {
      const pong = await this.redis.ping();
      const info = await this.redis.info('server');
      
      if (pong === 'PONG') {
        const details = this.parseRedisInfo(info);
        return this.getStatus(key, true, {
          status: 'connected',
          uptime: details.uptime,
          connected_clients: details.connected_clients,
          used_memory: details.used_memory_human,
          version: details.redis_version,
        });
      } else {
        return this.getStatus(key, false, {
          status: 'disconnected',
          message: 'Redis ping failed',
        });
      }
    } catch (error) {
      return this.getStatus(key, false, {
        status: 'error',
        message: error.message,
      });
    }
  }

  private parseRedisInfo(info: string): any {
    const lines = info.split('\r\n');
    const result: any = {};
    
    for (const line of lines) {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          result[key] = value;
        }
      }
    }
    
    return result;
  }
}
