import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { AddHoldingDto, UpdateHoldingDto } from './dto/add-holding.dto';
export declare class PortfolioService {
    private portfolios;
    private holdingIdCounter;
    private portfolioIdCounter;
    getUserPortfolios(userId: string): Promise<any[]>;
    getPortfolioById(portfolioId: string, userId: string): Promise<any>;
    createPortfolio(userId: string, dto: CreatePortfolioDto): Promise<any>;
    updatePortfolio(portfolioId: string, userId: string, dto: UpdatePortfolioDto): Promise<any>;
    deletePortfolio(portfolioId: string, userId: string): Promise<{
        message: string;
    }>;
    addHolding(portfolioId: string, userId: string, dto: AddHoldingDto): Promise<{
        id: string;
        portfolioId: string;
        companyId: string;
        companyName: any;
        ticker: any;
        quantity: number;
        averageBuyPrice: number;
        currentPrice: any;
        totalValue: number;
        profitLoss: number;
        profitLossPercent: number;
        lastPriceUpdate: string;
        createdAt: string;
        updatedAt: string;
    }>;
    updateHolding(portfolioId: string, holdingId: string, userId: string, dto: UpdateHoldingDto): Promise<any>;
    removeHolding(portfolioId: string, holdingId: string, userId: string): Promise<{
        message: string;
    }>;
    getPortfolioPerformance(portfolioId: string, userId: string): Promise<{
        portfolioId: string;
        portfolioName: any;
        totalCostBasis: number;
        totalCurrentValue: number;
        totalProfitLoss: number;
        totalProfitLossPercent: number;
        holdingsCount: any;
        topPerformer: any;
        worstPerformer: any;
        sectorAllocation: {
            sector: string;
            value: number;
            percentage: number;
        }[];
        performanceTimeline: any[];
    }>;
    private computePortfolioSummary;
}
