import { HealthIndicator, HealthCheckResult } from '@nestjs/terminus';
import Redis from 'ioredis';
export declare class RedisHealthIndicator extends HealthIndicator {
    private readonly redis;
    constructor(redis: Redis);
    isHealthy(key: string): Promise<HealthCheckResult>;
    private parseRedisInfo;
}
