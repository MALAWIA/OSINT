import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { AddHoldingDto, UpdateHoldingDto } from './dto/add-holding.dto';
export declare class PortfolioController {
    private portfolioService;
    constructor(portfolioService: PortfolioService);
    getUserPortfolios(user: any): Promise<any[]>;
    getPortfolio(id: string, user: any): Promise<any>;
    getPortfolioPerformance(id: string, user: any): Promise<{
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
    createPortfolio(dto: CreatePortfolioDto, user: any): Promise<any>;
    updatePortfolio(id: string, dto: UpdatePortfolioDto, user: any): Promise<any>;
    deletePortfolio(id: string, user: any): Promise<{
        message: string;
    }>;
    addHolding(id: string, dto: AddHoldingDto, user: any): Promise<{
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
    updateHolding(id: string, holdingId: string, dto: UpdateHoldingDto, user: any): Promise<any>;
    removeHolding(id: string, holdingId: string, user: any): Promise<{
        message: string;
    }>;
}
