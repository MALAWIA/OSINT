import { NewsService } from './news.service';
export declare class NewsController {
    private newsService;
    constructor(newsService: NewsService);
    findAll(page?: string, limit?: string, companyId?: string, sentiment?: string, search?: string): Promise<any[]>;
    getLatestNews(limit?: string): Promise<any[]>;
    getNewsStats(): Promise<{
        totalArticles: number;
        sentimentDistribution: {
            positive: number;
            negative: number;
            neutral: number;
        };
        averageSentiment: number;
        overallSentiment: string;
        categoryBreakdown: Record<string, number>;
    }>;
    findOne(id: string): Promise<any>;
    getNewsByCompany(companyId: string, limit?: string): Promise<any[]>;
    getNewsByKeyword(keyword: string, limit?: string): Promise<any[]>;
    getNewsBySentiment(sentiment: string, limit?: string): Promise<any[]>;
}
