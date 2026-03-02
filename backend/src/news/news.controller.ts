import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('news')
@UseGuards(JwtAuthGuard)
export class NewsController {
  constructor(private newsService: NewsService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('companyId') companyId?: string,
    @Query('sentiment') sentiment?: string,
    @Query('search') search?: string,
  ) {
    if (companyId) {
      return this.newsService.findByCompany(companyId, parseInt(limit) || 20);
    }
    if (sentiment) {
      return this.newsService.findBySentiment(sentiment, parseInt(limit) || 20);
    }
    if (search) {
      return this.newsService.search(search, parseInt(limit) || 20);
    }
    return this.newsService.findAll(parseInt(limit) || 20, 0);
  }

  @Get('latest')
  async getLatestNews(@Query('limit') limit?: string) {
    return this.newsService.getLatestNews(parseInt(limit) || 10);
  }

  @Get('stats')
  async getNewsStats() {
    return this.newsService.getNewsStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  @Get('company/:companyId')
  async getNewsByCompany(@Param('companyId') companyId: string, @Query('limit') limit?: string) {
    return this.newsService.findByCompany(companyId, parseInt(limit) || 20);
  }

  @Get('keyword/:keyword')
  async getNewsByKeyword(@Param('keyword') keyword: string, @Query('limit') limit?: string) {
    return this.newsService.findByKeyword(keyword, parseInt(limit) || 20);
  }

  @Get('sentiment/:sentiment')
  async getNewsBySentiment(@Param('sentiment') sentiment: string, @Query('limit') limit?: string) {
    return this.newsService.findBySentiment(sentiment, parseInt(limit) || 20);
  }
}
