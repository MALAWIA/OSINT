export declare class NewsService {
    private newsArticles;
    findAll(limit?: number, offset?: number): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findByCompany(companyId: string, limit?: number): Promise<any[]>;
    findByKeyword(keyword: string, limit?: number): Promise<any[]>;
    findBySentiment(sentiment: string, limit?: number): Promise<any[]>;
    findByCategory(category: string, limit?: number): Promise<any[]>;
    getLatestNews(limit?: number): Promise<any[]>;
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
    search(query: string, limit?: number): Promise<any[]>;
}
