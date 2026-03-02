import { CompaniesService } from './companies.service';
export declare class CompaniesController {
    private companiesService;
    constructor(companiesService: CompaniesService);
    findAll(page?: string, limit?: string, sector?: string, search?: string): Promise<any[] | {
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getSectors(): Promise<{
        count: number;
        totalMarketCap: number;
        companies: string[];
        name: string;
    }[]>;
    getTopGainers(limit?: string): Promise<any[]>;
    getTopLosers(limit?: string): Promise<any[]>;
    getMostActive(limit?: string): Promise<any[]>;
    getMarketStats(): Promise<{
        totalMarketCap: any;
        totalVolume: any;
        totalCompanies: number;
        gainers: number;
        losers: number;
        unchanged: number;
        marketSentiment: string;
        flaggedCompanies: number;
    }>;
    getFlaggedCompanies(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findBySymbol(symbol: string): Promise<any>;
}
