import { StockPricesService } from './stock-prices.service';
export declare class StockPricesController {
    private stockPricesService;
    constructor(stockPricesService: StockPricesService);
    getLiveTicker(): Promise<{
        change: number;
        changePercent: number;
        lastUpdated: string;
        companyId: string;
        ticker: string;
        name: string;
        sector: string;
        currentPrice: number;
        previousClose: number;
        open: number;
        high: number;
        low: number;
        volume: number;
        marketCap: number;
    }[]>;
    getMarketOverview(): Promise<{
        indices: {
            allShare: {
                value: number;
                change: number;
                changePercent: number;
            };
            nse20: {
                value: number;
                change: number;
                changePercent: number;
            };
        };
        totalMarketCap: number;
        totalVolume: number;
        totalStocks: number;
        gainers: number;
        losers: number;
        unchanged: number;
        marketSentiment: string;
        tradingDate: string;
        tradingStatus: string;
    }>;
    getSectorHeatmap(): Promise<{
        sector: string;
        stockCount: number;
        averageChange: number;
        totalMarketCap: number;
        intensity: number;
        direction: string;
    }[]>;
    getSectorPerformance(): Promise<{
        sector: string;
        stockCount: number;
        totalMarketCap: number;
        averageChange: number;
        topStock: any;
        sentiment: string;
    }[]>;
    getTopGainers(limit?: string): Promise<{
        change: number;
        changePercent: number;
        companyId: string;
        ticker: string;
        name: string;
        sector: string;
        currentPrice: number;
        previousClose: number;
        open: number;
        high: number;
        low: number;
        volume: number;
        marketCap: number;
    }[]>;
    getTopLosers(limit?: string): Promise<{
        change: number;
        changePercent: number;
        companyId: string;
        ticker: string;
        name: string;
        sector: string;
        currentPrice: number;
        previousClose: number;
        open: number;
        high: number;
        low: number;
        volume: number;
        marketCap: number;
    }[]>;
    getMostActive(limit?: string): Promise<{
        change: number;
        changePercent: number;
        companyId: string;
        ticker: string;
        name: string;
        sector: string;
        currentPrice: number;
        previousClose: number;
        open: number;
        high: number;
        low: number;
        volume: number;
        marketCap: number;
    }[]>;
    getBySymbol(ticker: string): Promise<{
        change: number;
        changePercent: number;
        lastUpdated: string;
        companyId: string;
        ticker: string;
        name: string;
        sector: string;
        currentPrice: number;
        previousClose: number;
        open: number;
        high: number;
        low: number;
        volume: number;
        marketCap: number;
    }>;
    getPriceHistory(ticker: string, range?: string, interval?: string): Promise<{
        ticker: string;
        name: string;
        range: string;
        interval: string;
        dataPoints: any[];
    }>;
    getByCompanyId(companyId: string): Promise<{
        change: number;
        changePercent: number;
        lastUpdated: string;
        companyId: string;
        ticker: string;
        name: string;
        sector: string;
        currentPrice: number;
        previousClose: number;
        open: number;
        high: number;
        low: number;
        volume: number;
        marketCap: number;
    }>;
}
