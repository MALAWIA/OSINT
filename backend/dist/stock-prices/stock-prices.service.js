"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockPricesService = void 0;
const common_1 = require("@nestjs/common");
let StockPricesService = class StockPricesService {
    constructor() {
        this.tickers = [
            {
                companyId: '1', ticker: 'SCOM', name: 'Safaricom PLC', sector: 'Telecommunications',
                currentPrice: 25.75, previousClose: 25.50, open: 25.55, high: 26.10, low: 25.40,
                volume: 15230000, marketCap: 1025000000000,
            },
            {
                companyId: '2', ticker: 'EQTY', name: 'Equity Group Holdings', sector: 'Banking',
                currentPrice: 48.50, previousClose: 49.25, open: 49.00, high: 49.50, low: 48.00,
                volume: 8400000, marketCap: 185000000000,
            },
            {
                companyId: '3', ticker: 'KCB', name: 'KCB Group', sector: 'Banking',
                currentPrice: 42.25, previousClose: 41.75, open: 42.00, high: 43.00, low: 41.50,
                volume: 6500000, marketCap: 142000000000,
            },
            {
                companyId: '4', ticker: 'EABL', name: 'East African Breweries', sector: 'Manufacturing',
                currentPrice: 155.00, previousClose: 152.50, open: 153.00, high: 156.50, low: 152.00,
                volume: 320000, marketCap: 122600000000,
            },
            {
                companyId: '5', ticker: 'BAT', name: 'BAT Kenya', sector: 'Manufacturing',
                currentPrice: 350.00, previousClose: 348.00, open: 349.00, high: 355.00, low: 347.00,
                volume: 45000, marketCap: 35000000000,
            },
            {
                companyId: '6', ticker: 'SBIC', name: 'Stanbic Holdings', sector: 'Banking',
                currentPrice: 112.00, previousClose: 110.50, open: 111.00, high: 113.50, low: 110.00,
                volume: 180000, marketCap: 44400000000,
            },
            {
                companyId: '7', ticker: 'COOP', name: 'Co-operative Bank', sector: 'Banking',
                currentPrice: 14.75, previousClose: 14.50, open: 14.60, high: 15.00, low: 14.40,
                volume: 4200000, marketCap: 86700000000,
            },
            {
                companyId: '8', ticker: 'ABSA', name: 'ABSA Bank Kenya', sector: 'Banking',
                currentPrice: 13.90, previousClose: 14.10, open: 14.00, high: 14.20, low: 13.80,
                volume: 3800000, marketCap: 75700000000,
            },
            {
                companyId: '9', ticker: 'NCBA', name: 'NCBA Group', sector: 'Banking',
                currentPrice: 44.50, previousClose: 43.75, open: 44.00, high: 45.25, low: 43.50,
                volume: 520000, marketCap: 73200000000,
            },
            {
                companyId: '10', ticker: 'KPLC', name: 'Kenya Power', sector: 'Energy',
                currentPrice: 3.20, previousClose: 3.15, open: 3.18, high: 3.30, low: 3.10,
                volume: 12000000, marketCap: 6240000000,
            },
            {
                companyId: '11', ticker: 'KEGN', name: 'KenGen', sector: 'Energy',
                currentPrice: 4.85, previousClose: 4.80, open: 4.82, high: 4.95, low: 4.75,
                volume: 2800000, marketCap: 31890000000,
            },
            {
                companyId: '12', ticker: 'BAMB', name: 'Bamburi Cement', sector: 'Construction',
                currentPrice: 28.50, previousClose: 29.00, open: 28.75, high: 29.25, low: 28.00,
                volume: 450000, marketCap: 10340000000,
            },
            {
                companyId: '13', ticker: 'SCAN', name: 'ScanGroup', sector: 'Commercial & Services',
                currentPrice: 8.50, previousClose: 8.40, open: 8.45, high: 8.65, low: 8.30,
                volume: 150000, marketCap: 3230000000,
            },
            {
                companyId: '14', ticker: 'JUB', name: 'Jubilee Holdings', sector: 'Insurance',
                currentPrice: 185.00, previousClose: 182.00, open: 183.00, high: 187.00, low: 181.50,
                volume: 32000, marketCap: 13320000000,
            },
            {
                companyId: '15', ticker: 'BRIT', name: 'Britam Holdings', sector: 'Insurance',
                currentPrice: 6.20, previousClose: 6.10, open: 6.15, high: 6.35, low: 6.05,
                volume: 1800000, marketCap: 14880000000,
            },
            {
                companyId: '16', ticker: 'FTAF', name: 'FinTech Africa Ltd', sector: 'Technology',
                currentPrice: 22.80, previousClose: 20.50, open: 21.00, high: 23.50, low: 20.80,
                volume: 9500000, marketCap: 11400000000,
            },
            {
                companyId: '17', ticker: 'MPAY', name: 'M-Pay Holdings', sector: 'Technology',
                currentPrice: 15.60, previousClose: 14.20, open: 14.50, high: 16.00, low: 14.30,
                volume: 7200000, marketCap: 7800000000,
            },
            {
                companyId: '18', ticker: 'TOTL', name: 'TotalEnergies Kenya', sector: 'Energy',
                currentPrice: 21.75, previousClose: 21.50, open: 21.60, high: 22.00, low: 21.30,
                volume: 350000, marketCap: 7900000000,
            },
            {
                companyId: '19', ticker: 'CGEN', name: 'CIC Insurance Group', sector: 'Insurance',
                currentPrice: 2.10, previousClose: 2.08, open: 2.09, high: 2.15, low: 2.05,
                volume: 5600000, marketCap: 5480000000,
            },
            {
                companyId: '20', ticker: 'DTK', name: 'Diamond Trust Bank', sector: 'Banking',
                currentPrice: 52.00, previousClose: 51.50, open: 51.75, high: 52.50, low: 51.25,
                volume: 85000, marketCap: 14560000000,
            },
        ];
    }
    async getLiveTicker() {
        return this.tickers.map(t => ({
            ...t,
            change: Math.round((t.currentPrice - t.previousClose) * 100) / 100,
            changePercent: Math.round(((t.currentPrice - t.previousClose) / t.previousClose) * 10000) / 100,
            lastUpdated: new Date().toISOString(),
        }));
    }
    async getTickerBySymbol(ticker) {
        const stock = this.tickers.find(t => t.ticker.toUpperCase() === ticker.toUpperCase());
        if (!stock) {
            throw new common_1.NotFoundException(`Stock ${ticker} not found`);
        }
        return {
            ...stock,
            change: Math.round((stock.currentPrice - stock.previousClose) * 100) / 100,
            changePercent: Math.round(((stock.currentPrice - stock.previousClose) / stock.previousClose) * 10000) / 100,
            lastUpdated: new Date().toISOString(),
        };
    }
    async getTickerById(companyId) {
        const stock = this.tickers.find(t => t.companyId === companyId);
        if (!stock) {
            throw new common_1.NotFoundException(`Stock with company ID ${companyId} not found`);
        }
        return {
            ...stock,
            change: Math.round((stock.currentPrice - stock.previousClose) * 100) / 100,
            changePercent: Math.round(((stock.currentPrice - stock.previousClose) / stock.previousClose) * 10000) / 100,
            lastUpdated: new Date().toISOString(),
        };
    }
    async getPriceHistory(ticker, range = '1m', interval = '1d') {
        const stock = this.tickers.find(t => t.ticker.toUpperCase() === ticker.toUpperCase());
        if (!stock) {
            throw new common_1.NotFoundException(`Stock ${ticker} not found`);
        }
        const now = new Date();
        const dataPoints = [];
        let days;
        switch (range) {
            case '1d':
                days = 1;
                break;
            case '5d':
                days = 5;
                break;
            case '1m':
                days = 30;
                break;
            case '3m':
                days = 90;
                break;
            case '6m':
                days = 180;
                break;
            case '1y':
                days = 365;
                break;
            case 'ytd':
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                days = Math.ceil((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
                break;
            default: days = 30;
        }
        const basePrice = stock.currentPrice;
        let currentPrice = basePrice * (1 - (Math.random() * 0.15));
        for (let i = days; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            if (date.getDay() === 0 || date.getDay() === 6)
                continue;
            const dailyChange = (Math.random() - 0.48) * basePrice * 0.03;
            currentPrice = Math.max(currentPrice + dailyChange, basePrice * 0.7);
            currentPrice = Math.min(currentPrice, basePrice * 1.3);
            const dayHigh = currentPrice * (1 + Math.random() * 0.02);
            const dayLow = currentPrice * (1 - Math.random() * 0.02);
            const dayOpen = currentPrice + (Math.random() - 0.5) * basePrice * 0.01;
            const dayVolume = Math.floor(stock.volume * (0.5 + Math.random()));
            dataPoints.push({
                date: date.toISOString().split('T')[0],
                open: Math.round(dayOpen * 100) / 100,
                high: Math.round(dayHigh * 100) / 100,
                low: Math.round(dayLow * 100) / 100,
                close: Math.round(currentPrice * 100) / 100,
                volume: dayVolume,
            });
        }
        if (dataPoints.length > 0) {
            dataPoints[dataPoints.length - 1].close = stock.currentPrice;
        }
        return {
            ticker: stock.ticker,
            name: stock.name,
            range,
            interval,
            dataPoints,
        };
    }
    async getTopGainers(limit = 10) {
        return this.tickers
            .map(t => ({
            ...t,
            change: Math.round((t.currentPrice - t.previousClose) * 100) / 100,
            changePercent: Math.round(((t.currentPrice - t.previousClose) / t.previousClose) * 10000) / 100,
        }))
            .filter(t => t.changePercent > 0)
            .sort((a, b) => b.changePercent - a.changePercent)
            .slice(0, limit);
    }
    async getTopLosers(limit = 10) {
        return this.tickers
            .map(t => ({
            ...t,
            change: Math.round((t.currentPrice - t.previousClose) * 100) / 100,
            changePercent: Math.round(((t.currentPrice - t.previousClose) / t.previousClose) * 10000) / 100,
        }))
            .filter(t => t.changePercent < 0)
            .sort((a, b) => a.changePercent - b.changePercent)
            .slice(0, limit);
    }
    async getMostActive(limit = 10) {
        return this.tickers
            .map(t => ({
            ...t,
            change: Math.round((t.currentPrice - t.previousClose) * 100) / 100,
            changePercent: Math.round(((t.currentPrice - t.previousClose) / t.previousClose) * 10000) / 100,
        }))
            .sort((a, b) => b.volume - a.volume)
            .slice(0, limit);
    }
    async getSectorPerformance() {
        const sectorMap = {};
        for (const t of this.tickers) {
            if (!sectorMap[t.sector]) {
                sectorMap[t.sector] = { stocks: [], totalMarketCap: 0 };
            }
            const changePercent = ((t.currentPrice - t.previousClose) / t.previousClose) * 100;
            sectorMap[t.sector].stocks.push({ ...t, changePercent });
            sectorMap[t.sector].totalMarketCap += t.marketCap;
        }
        return Object.entries(sectorMap).map(([sector, data]) => {
            const avgChange = data.stocks.reduce((sum, s) => sum + s.changePercent, 0) / data.stocks.length;
            return {
                sector,
                stockCount: data.stocks.length,
                totalMarketCap: data.totalMarketCap,
                averageChange: Math.round(avgChange * 100) / 100,
                topStock: data.stocks.sort((a, b) => b.changePercent - a.changePercent)[0]?.ticker,
                sentiment: avgChange > 0.5 ? 'bullish' : avgChange < -0.5 ? 'bearish' : 'neutral',
            };
        }).sort((a, b) => b.averageChange - a.averageChange);
    }
    async getMarketOverview() {
        const stocks = this.tickers.map(t => ({
            ...t,
            change: t.currentPrice - t.previousClose,
            changePercent: ((t.currentPrice - t.previousClose) / t.previousClose) * 100,
        }));
        const totalMarketCap = stocks.reduce((sum, s) => sum + s.marketCap, 0);
        const totalVolume = stocks.reduce((sum, s) => sum + s.volume, 0);
        const gainers = stocks.filter(s => s.changePercent > 0).length;
        const losers = stocks.filter(s => s.changePercent < 0).length;
        const unchanged = stocks.filter(s => s.changePercent === 0).length;
        const allShareIndex = 168.45;
        const allShareChange = 3.2;
        const allShareChangePercent = (allShareChange / allShareIndex) * 100;
        const nse20Index = 1845.67;
        const nse20Change = 12.34;
        const nse20ChangePercent = (nse20Change / nse20Index) * 100;
        return {
            indices: {
                allShare: {
                    value: allShareIndex,
                    change: allShareChange,
                    changePercent: Math.round(allShareChangePercent * 100) / 100,
                },
                nse20: {
                    value: nse20Index,
                    change: nse20Change,
                    changePercent: Math.round(nse20ChangePercent * 100) / 100,
                },
            },
            totalMarketCap,
            totalVolume,
            totalStocks: stocks.length,
            gainers,
            losers,
            unchanged,
            marketSentiment: gainers > losers ? 'bullish' : gainers < losers ? 'bearish' : 'neutral',
            tradingDate: new Date().toISOString().split('T')[0],
            tradingStatus: this.isTradingHours() ? 'open' : 'closed',
        };
    }
    async getSectorHeatmap() {
        const sectorPerformance = await this.getSectorPerformance();
        return sectorPerformance.map(sp => ({
            sector: sp.sector,
            stockCount: sp.stockCount,
            averageChange: sp.averageChange,
            totalMarketCap: sp.totalMarketCap,
            intensity: Math.abs(sp.averageChange),
            direction: sp.averageChange > 0 ? 'up' : sp.averageChange < 0 ? 'down' : 'flat',
        }));
    }
    isTradingHours() {
        const now = new Date();
        const eatOffset = 3;
        const eatHour = now.getUTCHours() + eatOffset;
        const day = now.getUTCDay();
        if (day === 0 || day === 6)
            return false;
        if (eatHour < 9 || (eatHour === 9 && now.getUTCMinutes() < 30))
            return false;
        if (eatHour >= 15)
            return false;
        return true;
    }
};
exports.StockPricesService = StockPricesService;
exports.StockPricesService = StockPricesService = __decorate([
    (0, common_1.Injectable)()
], StockPricesService);
//# sourceMappingURL=stock-prices.service.js.map