import { HealthCheckService, TypeOrmHealthIndicator, DiskHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health-indicator';
import { ElasticsearchHealthIndicator } from './elasticsearch.health-indicator';
export declare class HealthController {
    private health;
    private db;
    private redis;
    private elasticsearch;
    private disk;
    private memory;
    constructor(health: HealthCheckService, db: TypeOrmHealthIndicator, redis: RedisHealthIndicator, elasticsearch: ElasticsearchHealthIndicator, disk: DiskHealthIndicator, memory: MemoryHealthIndicator);
    check(): Promise<any>;
    ready(): Promise<any>;
    live(): Promise<any>;
    detailed(): Promise<{
        status: any;
        timestamp: string;
        uptime: {
            seconds: number;
            human: string;
        };
        version: string;
        environment: string;
        details: any;
        system: {
            platform: NodeJS.Platform;
            arch: NodeJS.Architecture;
            node_version: string;
            memory: NodeJS.MemoryUsage;
            cpu: NodeJS.CpuUsage;
        };
    }>;
    private formatUptime;
}
