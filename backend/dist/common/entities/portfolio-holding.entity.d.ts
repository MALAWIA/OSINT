import { Portfolio } from './portfolio.entity';
import { Company } from './company.entity';
export declare class PortfolioHolding {
    id: string;
    portfolioId: string;
    companyId: string;
    quantity: number;
    averageBuyPrice: number;
    currentPrice: number;
    totalValue: number;
    profitLoss: number;
    profitLossPercent: number;
    lastPriceUpdate: Date;
    createdAt: Date;
    updatedAt: Date;
    portfolio: Portfolio;
    company: Company;
}
