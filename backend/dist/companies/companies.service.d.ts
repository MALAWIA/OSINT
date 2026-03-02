export declare class CompaniesService {
    private companies;
    findAll(page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<any>;
    findBySymbol(symbol: string): Promise<any>;
    findBySector(sector: string): Promise<any[]>;
    search(query: string): Promise<any[]>;
    getTopGainers(limit?: number): Promise<any[]>;
    getTopLosers(limit?: number): Promise<any[]>;
    getMostActive(limit?: number): Promise<any[]>;
    getSectors(): Promise<{
        count: number;
        totalMarketCap: number;
        companies: string[];
        name: string;
    }[]>;
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
}
