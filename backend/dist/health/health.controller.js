"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const terminus_1 = require("@nestjs/terminus");
const redis_health_indicator_1 = require("./redis.health-indicator");
const elasticsearch_health_indicator_1 = require("./elasticsearch.health-indicator");
let HealthController = class HealthController {
    constructor(health, db, redis, elasticsearch, disk, memory) {
        this.health = health;
        this.db = db;
        this.redis = redis;
        this.elasticsearch = elasticsearch;
        this.disk = disk;
        this.memory = memory;
    }
    async check() {
        return this.health.check([
            () => this.db.pingCheck('database'),
            () => this.redis.isHealthy('redis'),
            () => this.elasticsearch.isHealthy('elasticsearch'),
            () => this.disk.checkStorage('storage', { threshold: 0.9, path: '/' }),
            () => this.memory.checkHeap('memory_heap', { threshold: 0.9 }),
            () => this.memory.checkRSS('memory_rss', { threshold: 0.9 }),
        ]);
    }
    async ready() {
        return this.health.check([
            () => this.db.pingCheck('database'),
            () => this.redis.isHealthy('redis'),
            () => this.elasticsearch.isHealthy('elasticsearch'),
        ]);
    }
    async live() {
        return this.health.check([
            () => this.memory.checkHeap('memory_heap', { threshold: 0.95 }),
        ]);
    }
    async detailed() {
        const basic = await this.check();
        const uptime = process.uptime();
        const timestamp = new Date().toISOString();
        return {
            status: basic.status,
            timestamp,
            uptime: {
                seconds: uptime,
                human: this.formatUptime(uptime),
            },
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            details: basic.details,
            system: {
                platform: process.platform,
                arch: process.arch,
                node_version: process.version,
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
            },
        };
    }
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${days}d ${hours}h ${minutes}m ${secs}s`;
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check application health' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application is healthy' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Application is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('ready'),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check if application is ready' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application is ready' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Application is not ready' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "ready", null);
__decorate([
    (0, common_1.Get)('live'),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check if application is alive' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Application is alive' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Application is not alive' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "live", null);
__decorate([
    (0, common_1.Get)('detailed'),
    (0, swagger_1.ApiOperation)({ summary: 'Get detailed health information' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detailed health information' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "detailed", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [typeof (_a = typeof terminus_1.HealthCheckService !== "undefined" && terminus_1.HealthCheckService) === "function" ? _a : Object, typeof (_b = typeof terminus_1.TypeOrmHealthIndicator !== "undefined" && terminus_1.TypeOrmHealthIndicator) === "function" ? _b : Object, redis_health_indicator_1.RedisHealthIndicator,
        elasticsearch_health_indicator_1.ElasticsearchHealthIndicator, typeof (_c = typeof terminus_1.DiskHealthIndicator !== "undefined" && terminus_1.DiskHealthIndicator) === "function" ? _c : Object, typeof (_d = typeof terminus_1.MemoryHealthIndicator !== "undefined" && terminus_1.MemoryHealthIndicator) === "function" ? _d : Object])
], HealthController);
//# sourceMappingURL=health.controller.js.map