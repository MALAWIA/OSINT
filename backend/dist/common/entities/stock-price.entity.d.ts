import { Company } from './company.entity';
export declare class StockPrice {
    id: string;
    companyId: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
    changePercent: number;
    tradedAt: Date;
    createdAt: Date;
    company: Company;
}
