import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './redis.health-indicator';
import { ElasticsearchHealthIndicator } from './elasticsearch.health-indicator';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    TerminusModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        // Your TypeORM configuration
      }),
    }),
    RedisModule.forRootAsync({
      useFactory: () => ({
        config: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD,
        },
      }),
    }),
    ElasticsearchModule.forRootAsync({
      useFactory: () => ({
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
        auth: process.env.ELASTIC_PASSWORD ? {
          username: 'elastic',
          password: process.env.ELASTIC_PASSWORD,
        } : undefined,
      }),
    }),
  ],
  controllers: [HealthController],
  providers: [RedisHealthIndicator, ElasticsearchHealthIndicator],
})
export class HealthModule {}
