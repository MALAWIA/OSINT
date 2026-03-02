import { HealthService } from './health.service';
export declare class HealthController {
    private healthService;
    constructor(healthService: HealthService);
    check(): Promise<any>;
    ready(): Promise<any>;
    live(): Promise<any>;
}
