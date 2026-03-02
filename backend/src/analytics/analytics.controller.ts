import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(@Query('hours') hours?: string) {
    return this.analyticsService.getOverview(parseInt(hours) || 24);
  }

  @Get('users')
  async getUserAnalytics(@Query('hours') hours?: string) {
    return this.analyticsService.getUserAnalytics(parseInt(hours) || 24);
  }

  @Get('sentiment')
  async getSentimentAnalytics(@Query('hours') hours?: string) {
    return this.analyticsService.getSentimentAnalytics(parseInt(hours) || 24);
  }

  @Get('trending')
  async getTrendingAnalytics(@Query('hours') hours?: string) {
    return this.analyticsService.getTrendingAnalytics(parseInt(hours) || 24);
  }

  @Get('moderation')
  async getModerationAnalytics(@Query('hours') hours?: string) {
    return this.analyticsService.getModerationAnalytics(parseInt(hours) || 24);
  }

  @Get('engagement')
  async getEngagementAnalytics(@Query('hours') hours?: string) {
    return this.analyticsService.getEngagementAnalytics(parseInt(hours) || 24);
  }

  @Get('health')
  async getHealthMetrics(@CurrentUser() user: any) {
    if (!user.isAdmin) {
      throw new Error('Admin access required');
    }
    return this.analyticsService.getHealthMetrics();
  }
}
