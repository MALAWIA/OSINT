import { NewsArticle } from './news-article.entity';
import { Company } from './company.entity';
export declare class SentimentAnalysis {
    id: string;
    articleId: string;
    companyId?: string;
    sentimentScore: number;
    sentimentLabel: 'positive' | 'negative' | 'neutral';
    confidence?: number;
    entities?: any[];
    keywords?: string[];
    createdAt: Date;
    article: NewsArticle;
    company?: Company;
}
