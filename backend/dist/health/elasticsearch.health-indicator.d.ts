import { HealthIndicator, HealthCheckResult } from '@nestjs/terminus';
import { Client } from '@elastic/elasticsearch';
export declare class ElasticsearchHealthIndicator extends HealthIndicator {
    private readonly client;
    constructor(client: Client);
    isHealthy(key: string): Promise<HealthCheckResult>;
}
