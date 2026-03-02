import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { StockPricesService } from './stock-prices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stock-prices')
@UseGuards(JwtAuthGuard)
export class StockPricesController {
  constructor(private stockPricesService: StockPricesService) {}

  @Get('ticker')
  async getLiveTicker() {
    return this.stockPricesService.getLiveTicker();
  }

  @Get('overview')
  async getMarketOverview() {
    return this.stockPricesService.getMarketOverview();
  }

  @Get('heatmap')
  async getSectorHeatmap() {
    return this.stockPricesService.getSectorHeatmap();
  }

  @Get('sectors')
  async getSectorPerformance() {
    return this.stockPricesService.getSectorPerformance();
  }

  @Get('gainers')
  async getTopGainers(@Query('limit') limit?: string) {
    return this.stockPricesService.getTopGainers(parseInt(limit) || 10);
  }

  @Get('losers')
  async getTopLosers(@Query('limit') limit?: string) {
    return this.stockPricesService.getTopLosers(parseInt(limit) || 10);
  }

  @Get('active')
  async getMostActive(@Query('limit') limit?: string) {
    return this.stockPricesService.getMostActive(parseInt(limit) || 10);
  }

  @Get('symbol/:ticker')
  async getBySymbol(@Param('ticker') ticker: string) {
    return this.stockPricesService.getTickerBySymbol(ticker);
  }

  @Get('symbol/:ticker/history')
  async getPriceHistory(
    @Param('ticker') ticker: string,
    @Query('range') range?: string,
    @Query('interval') interval?: string,
  ) {
    return this.stockPricesService.getPriceHistory(ticker, range || '1m', interval || '1d');
  }

  @Get('company/:companyId')
  async getByCompanyId(@Param('companyId') companyId: string) {
    return this.stockPricesService.getTickerById(companyId);
  }
}
