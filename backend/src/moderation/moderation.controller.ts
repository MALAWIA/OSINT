import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ModerationService } from './moderation.service';
import { User } from '../common/entities/user.entity';

@Controller('moderation')
@UseGuards(JwtAuthGuard)
export class ModerationController {
  constructor(private moderationService: ModerationService) {}

  @Post('flag')
  async createFlag(@Body() flagData: any, @CurrentUser() user: User) {
    const flag = await this.moderationService.createFlag({
      ...flagData,
      flaggerId: user.id,
    });
    return { success: true, flag };
  }

  @Get('pending')
  async getPendingFlags(@CurrentUser() user: User) {
    if (!user.isModerator && !user.isAdmin) {
      throw new Error('Access denied');
    }
    return this.moderationService.getPendingFlags();
  }

  @Put('review/:id')
  async reviewFlag(
    @Param('id') id: string,
    @Body() reviewData: { status: string; notes?: string },
    @CurrentUser() user: User
  ) {
    if (!user.isModerator && !user.isAdmin) {
      throw new Error('Access denied');
    }
    await this.moderationService.reviewFlag(id, user.id, reviewData.status as any, reviewData.notes);
    return { success: true };
  }

  @Get('content')
  async getFlaggedContent(@CurrentUser() user: User) {
    if (!user.isModerator && !user.isAdmin) {
      throw new Error('Access denied');
    }
    return this.moderationService.getFlaggedContent();
  }

  @Get('stats')
  async getModerationStats(@CurrentUser() user: User) {
    if (!user.isModerator && !user.isAdmin) {
      throw new Error('Access denied');
    }
    return this.moderationService.getModerationStats();
  }
}
