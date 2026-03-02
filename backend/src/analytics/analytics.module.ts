import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { User } from '../common/entities/user.entity';
import { Message } from '../common/entities/message.entity';
import { NewsArticle } from '../common/entities/news-article.entity';
import { Company } from '../common/entities/company.entity';
import { SentimentAnalysis } from '../common/entities/sentiment-analysis.entity';
import { ModerationFlag } from '../common/entities/moderation-flag.entity';
import { DetectedEvent } from '../common/entities/detected-event.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Message,
      NewsArticle,
      Company,
      SentimentAnalysis,
      ModerationFlag,
      DetectedEvent,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
