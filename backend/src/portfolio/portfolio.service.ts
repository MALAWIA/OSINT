import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { AddHoldingDto, UpdateHoldingDto } from './dto/add-holding.dto';

@Injectable()
export class PortfolioService {
  private portfolios: any[] = [
    {
      id: 'p1',
      userId: '1',
      name: 'My NSE Portfolio',
      description: 'Primary portfolio tracking NSE blue-chip stocks',
      isDefault: true,
      isActive: true,
      createdAt: new Date('2026-01-15').toISOString(),
      updatedAt: new Date('2026-02-10').toISOString(),
      holdings: [
        {
          id: 'h1',
          portfolioId: 'p1',
          companyId: '1',
          companyName: 'Safaricom PLC',
          ticker: 'SCOM',
          quantity: 5000,
          averageBuyPrice: 23.50,
          currentPrice: 25.75,
          totalValue: 128750,
          profitLoss: 11250,
          profitLossPercent: 9.57,
          lastPriceUpdate: new Date().toISOString(),
          createdAt: new Date('2026-01-15').toISOString(),
          updatedAt: new Date('2026-02-10').toISOString(),
        },
        {
          id: 'h2',
          portfolioId: 'p1',
          companyId: '2',
          companyName: 'Equity Group Holdings',
          ticker: 'EQTY',
          quantity: 2000,
          averageBuyPrice: 50.25,
          currentPrice: 48.50,
          totalValue: 97000,
          profitLoss: -3500,
          profitLossPercent: -3.48,
          lastPriceUpdate: new Date().toISOString(),
          createdAt: new Date('2026-01-20').toISOString(),
          updatedAt: new Date('2026-02-10').toISOString(),
        },
        {
          id: 'h3',
          portfolioId: 'p1',
          companyId: '3',
          companyName: 'KCB Group',
          ticker: 'KCB',
          quantity: 3000,
          averageBuyPrice: 40.00,
          currentPrice: 42.25,
          totalValue: 126750,
          profitLoss: 6750,
          profitLossPercent: 5.63,
          lastPriceUpdate: new Date().toISOString(),
          createdAt: new Date('2026-01-25').toISOString(),
          updatedAt: new Date('2026-02-10').toISOString(),
        },
      ],
    },
    {
      id: 'p2',
      userId: '1',
      name: 'Tech & Telco Watch',
      description: 'Tracking technology and telecommunications sector',
      isDefault: false,
      isActive: true,
      createdAt: new Date('2026-02-01').toISOString(),
      updatedAt: new Date('2026-02-10').toISOString(),
      holdings: [
        {
          id: 'h4',
          portfolioId: 'p2',
          companyId: '1',
          companyName: 'Safaricom PLC',
          ticker: 'SCOM',
          quantity: 10000,
          averageBuyPrice: 24.00,
          currentPrice: 25.75,
          totalValue: 257500,
          profitLoss: 17500,
          profitLossPercent: 7.29,
          lastPriceUpdate: new Date().toISOString(),
          createdAt: new Date('2026-02-01').toISOString(),
          updatedAt: new Date('2026-02-10').toISOString(),
        },
      ],
    },
  ];

  private holdingIdCounter = 5;
  private portfolioIdCounter = 3;

  async getUserPortfolios(userId: string) {
    const userPortfolios = this.portfolios.filter(p => p.userId === userId && p.isActive);
    return userPortfolios.map(p => this.computePortfolioSummary(p));
  }

  async getPortfolioById(portfolioId: string, userId: string) {
    const portfolio = this.portfolios.find(p => p.id === portfolioId && p.userId === userId);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    return this.computePortfolioSummary(portfolio);
  }

  async createPortfolio(userId: string, dto: CreatePortfolioDto) {
    // If setting as default, unset other defaults
    if (dto.isDefault) {
      this.portfolios
        .filter(p => p.userId === userId)
        .forEach(p => p.isDefault = false);
    }

    const portfolio = {
      id: `p${this.portfolioIdCounter++}`,
      userId,
      name: dto.name,
      description: dto.description || null,
      isDefault: dto.isDefault || false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      holdings: [],
    };

    this.portfolios.push(portfolio);
    return this.computePortfolioSummary(portfolio);
  }

  async updatePortfolio(portfolioId: string, userId: string, dto: UpdatePortfolioDto) {
    const portfolio = this.portfolios.find(p => p.id === portfolioId && p.userId === userId);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    if (dto.isDefault) {
      this.portfolios
        .filter(p => p.userId === userId)
        .forEach(p => p.isDefault = false);
    }

    Object.assign(portfolio, {
      ...dto,
      updatedAt: new Date().toISOString(),
    });

    return this.computePortfolioSummary(portfolio);
  }

  async deletePortfolio(portfolioId: string, userId: string) {
    const portfolio = this.portfolios.find(p => p.id === portfolioId && p.userId === userId);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    portfolio.isActive = false;
    portfolio.updatedAt = new Date().toISOString();
    return { message: 'Portfolio deleted successfully' };
  }

  async addHolding(portfolioId: string, userId: string, dto: AddHoldingDto) {
    const portfolio = this.portfolios.find(p => p.id === portfolioId && p.userId === userId);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    // Check if holding already exists
    const existingHolding = portfolio.holdings.find(h => h.companyId === dto.companyId);
    if (existingHolding) {
      throw new BadRequestException('Holding already exists in this portfolio. Use update instead.');
    }

    // Look up mock company data
    const companyMap = {
      '1': { name: 'Safaricom PLC', ticker: 'SCOM', currentPrice: 25.75 },
      '2': { name: 'Equity Group Holdings', ticker: 'EQTY', currentPrice: 48.50 },
      '3': { name: 'KCB Group', ticker: 'KCB', currentPrice: 42.25 },
      '4': { name: 'East African Breweries', ticker: 'EABL', currentPrice: 155.00 },
      '5': { name: 'BAT Kenya', ticker: 'BAT', currentPrice: 350.00 },
      '6': { name: 'Stanbic Holdings', ticker: 'SBIC', currentPrice: 112.00 },
      '7': { name: 'Co-operative Bank', ticker: 'COOP', currentPrice: 14.75 },
      '8': { name: 'ABSA Bank Kenya', ticker: 'ABSA', currentPrice: 13.90 },
      '9': { name: 'NCBA Group', ticker: 'NCBA', currentPrice: 44.50 },
      '10': { name: 'Kenya Power', ticker: 'KPLC', currentPrice: 3.20 },
    };

    const company = companyMap[dto.companyId];
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const currentPrice = company.currentPrice;
    const totalValue = dto.quantity * currentPrice;
    const costBasis = dto.quantity * dto.averageBuyPrice;
    const profitLoss = totalValue - costBasis;
    const profitLossPercent = costBasis > 0 ? ((profitLoss / costBasis) * 100) : 0;

    const holding = {
      id: `h${this.holdingIdCounter++}`,
      portfolioId,
      companyId: dto.companyId,
      companyName: company.name,
      ticker: company.ticker,
      quantity: dto.quantity,
      averageBuyPrice: dto.averageBuyPrice,
      currentPrice,
      totalValue,
      profitLoss,
      profitLossPercent: Math.round(profitLossPercent * 100) / 100,
      lastPriceUpdate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    portfolio.holdings.push(holding);
    portfolio.updatedAt = new Date().toISOString();

    return holding;
  }

  async updateHolding(portfolioId: string, holdingId: string, userId: string, dto: UpdateHoldingDto) {
    const portfolio = this.portfolios.find(p => p.id === portfolioId && p.userId === userId);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const holding = portfolio.holdings.find(h => h.id === holdingId);
    if (!holding) {
      throw new NotFoundException('Holding not found');
    }

    holding.quantity = dto.quantity;
    holding.averageBuyPrice = dto.averageBuyPrice;
    const totalValue = dto.quantity * holding.currentPrice;
    const costBasis = dto.quantity * dto.averageBuyPrice;
    holding.totalValue = totalValue;
    holding.profitLoss = totalValue - costBasis;
    holding.profitLossPercent = costBasis > 0
      ? Math.round(((holding.profitLoss / costBasis) * 100) * 100) / 100
      : 0;
    holding.updatedAt = new Date().toISOString();
    portfolio.updatedAt = new Date().toISOString();

    return holding;
  }

  async removeHolding(portfolioId: string, holdingId: string, userId: string) {
    const portfolio = this.portfolios.find(p => p.id === portfolioId && p.userId === userId);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const holdingIndex = portfolio.holdings.findIndex(h => h.id === holdingId);
    if (holdingIndex === -1) {
      throw new NotFoundException('Holding not found');
    }

    portfolio.holdings.splice(holdingIndex, 1);
    portfolio.updatedAt = new Date().toISOString();

    return { message: 'Holding removed successfully' };
  }

  async getPortfolioPerformance(portfolioId: string, userId: string) {
    const portfolio = this.portfolios.find(p => p.id === portfolioId && p.userId === userId);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const totalCostBasis = portfolio.holdings.reduce(
      (sum, h) => sum + (h.quantity * h.averageBuyPrice), 0,
    );
    const totalCurrentValue = portfolio.holdings.reduce(
      (sum, h) => sum + h.totalValue, 0,
    );
    const totalProfitLoss = totalCurrentValue - totalCostBasis;
    const totalProfitLossPercent = totalCostBasis > 0
      ? Math.round(((totalProfitLoss / totalCostBasis) * 100) * 100) / 100
      : 0;

    // Mock performance timeline (daily)
    const timeline = [];
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const variation = (Math.random() - 0.3) * 0.02;
      const dayValue = totalCurrentValue * (1 + variation * (30 - i) / 30);
      timeline.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(dayValue * 100) / 100,
      });
    }

    // Mock sector allocation
    const sectorMap: Record<string, number> = {};
    for (const holding of portfolio.holdings) {
      const sectorLookup = {
        SCOM: 'Telecommunications',
        EQTY: 'Banking',
        KCB: 'Banking',
        EABL: 'Manufacturing',
        BAT: 'Manufacturing',
        SBIC: 'Banking',
        COOP: 'Banking',
        ABSA: 'Banking',
        NCBA: 'Banking',
        KPLC: 'Energy',
      };
      const sector = sectorLookup[holding.ticker] || 'Other';
      sectorMap[sector] = (sectorMap[sector] || 0) + holding.totalValue;
    }

    const sectorAllocation = Object.entries(sectorMap).map(([sector, value]) => ({
      sector,
      value: Math.round(value * 100) / 100,
      percentage: Math.round((value / totalCurrentValue) * 10000) / 100,
    }));

    return {
      portfolioId,
      portfolioName: portfolio.name,
      totalCostBasis: Math.round(totalCostBasis * 100) / 100,
      totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
      totalProfitLoss: Math.round(totalProfitLoss * 100) / 100,
      totalProfitLossPercent,
      holdingsCount: portfolio.holdings.length,
      topPerformer: portfolio.holdings.length > 0
        ? portfolio.holdings.reduce((best, h) => h.profitLossPercent > best.profitLossPercent ? h : best)
        : null,
      worstPerformer: portfolio.holdings.length > 0
        ? portfolio.holdings.reduce((worst, h) => h.profitLossPercent < worst.profitLossPercent ? h : worst)
        : null,
      sectorAllocation,
      performanceTimeline: timeline,
    };
  }

  private computePortfolioSummary(portfolio: any) {
    const totalValue = portfolio.holdings.reduce((sum, h) => sum + h.totalValue, 0);
    const totalCost = portfolio.holdings.reduce(
      (sum, h) => sum + (h.quantity * h.averageBuyPrice), 0,
    );
    const totalProfitLoss = totalValue - totalCost;
    const totalProfitLossPercent = totalCost > 0
      ? Math.round(((totalProfitLoss / totalCost) * 100) * 100) / 100
      : 0;

    return {
      ...portfolio,
      summary: {
        totalValue: Math.round(totalValue * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        totalProfitLoss: Math.round(totalProfitLoss * 100) / 100,
        totalProfitLossPercent,
        holdingsCount: portfolio.holdings.length,
      },
    };
  }
}
