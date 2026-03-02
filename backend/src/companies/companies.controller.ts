import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sector') sector?: string,
    @Query('search') search?: string,
  ) {
    if (sector) {
      return this.companiesService.findBySector(sector);
    }
    if (search) {
      return this.companiesService.search(search);
    }
    return this.companiesService.findAll(parseInt(page) || 1, parseInt(limit) || 50);
  }

  @Get('sectors')
  async getSectors() {
    return this.companiesService.getSectors();
  }

  @Get('gainers')
  async getTopGainers(@Query('limit') limit?: string) {
    return this.companiesService.getTopGainers(parseInt(limit) || 10);
  }

  @Get('losers')
  async getTopLosers(@Query('limit') limit?: string) {
    return this.companiesService.getTopLosers(parseInt(limit) || 10);
  }

  @Get('active')
  async getMostActive(@Query('limit') limit?: string) {
    return this.companiesService.getMostActive(parseInt(limit) || 10);
  }

  @Get('stats')
  async getMarketStats() {
    return this.companiesService.getMarketStats();
  }

  @Get('flagged')
  async getFlaggedCompanies() {
    return this.companiesService.getFlaggedCompanies();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Get('symbol/:symbol')
  async findBySymbol(@Param('symbol') symbol: string) {
    return this.companiesService.findBySymbol(symbol);
  }
}
