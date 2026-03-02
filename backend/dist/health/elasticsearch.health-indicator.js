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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElasticsearchHealthIndicator = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const elasticsearch_1 = require("@elastic/elasticsearch");
let ElasticsearchHealthIndicator = class ElasticsearchHealthIndicator extends terminus_1.HealthIndicator {
    constructor(client) {
        super();
        this.client = client;
    }
    async isHealthy(key) {
        try {
            const health = await this.client.cluster.health({
                timeout: '5s',
            });
            const status = health.status;
            const isHealthy = ['green', 'yellow'].includes(status);
            return this.getStatus(key, isHealthy, {
                status,
                cluster_name: health.cluster_name,
                number_of_nodes: health.number_of_nodes,
                number_of_data_nodes: health.number_of_data_nodes,
                active_primary_shards: health.active_primary_shards,
                active_shards: health.active_shards,
                relocating_shards: health.relocating_shards,
                initializing_shards: health.initializing_shards,
                unassigned_shards: health.unassigned_shards,
                delayed_unassigned_shards: health.delayed_unassigned_shards,
                number_of_pending_tasks: health.number_of_pending_tasks,
                task_max_waiting_in_queue_millis: health.task_max_waiting_in_queue_millis,
                active_shards_percent_as_number: health.active_shards_percent_as_number,
            });
        }
        catch (error) {
            return this.getStatus(key, false, {
                status: 'error',
                message: error.message,
            });
        }
    }
};
exports.ElasticsearchHealthIndicator = ElasticsearchHealthIndicator;
exports.ElasticsearchHealthIndicator = ElasticsearchHealthIndicator = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [elasticsearch_1.Client])
], ElasticsearchHealthIndicator);
//# sourceMappingURL=elasticsearch.health-indicator.js.map