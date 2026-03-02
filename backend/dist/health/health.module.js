"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthModule = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const health_controller_1 = require("./health.controller");
const redis_health_indicator_1 = require("./redis.health-indicator");
const elasticsearch_health_indicator_1 = require("./elasticsearch.health-indicator");
const typeorm_1 = require("@nestjs/typeorm");
const ioredis_1 = require("@nestjs-modules/ioredis");
const elasticsearch_1 = require("@nestjs/elasticsearch");
let HealthModule = class HealthModule {
};
exports.HealthModule = HealthModule;
exports.HealthModule = HealthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            terminus_1.TerminusModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => ({}),
            }),
            ioredis_1.RedisModule.forRootAsync({
                useFactory: () => ({
                    config: {
                        host: process.env.REDIS_HOST || 'localhost',
                        port: parseInt(process.env.REDIS_PORT) || 6379,
                        password: process.env.REDIS_PASSWORD,
                    },
                }),
            }),
            elasticsearch_1.ElasticsearchModule.forRootAsync({
                useFactory: () => ({
                    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
                    auth: process.env.ELASTIC_PASSWORD ? {
                        username: 'elastic',
                        password: process.env.ELASTIC_PASSWORD,
                    } : undefined,
                }),
            }),
        ],
        controllers: [health_controller_1.HealthController],
        providers: [redis_health_indicator_1.RedisHealthIndicator, elasticsearch_health_indicator_1.ElasticsearchHealthIndicator],
    })
], HealthModule);
//# sourceMappingURL=health.module.js.map