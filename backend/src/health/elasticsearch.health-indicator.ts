import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthCheckResult } from '@nestjs/terminus';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchHealthIndicator extends HealthIndicator {
  constructor(private readonly client: Client) {
    super();
  }

  async isHealthy(key: string): Promise<HealthCheckResult> {
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
    } catch (error) {
      return this.getStatus(key, false, {
        status: 'error',
        message: error.message,
      });
    }
  }
}
