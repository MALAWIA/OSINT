import { NewsArticle } from './news-article.entity';
import { Company } from './company.entity';
export declare class DetectedEvent {
    id: string;
    articleId: string;
    companyId?: string;
    eventType: 'earnings' | 'merger' | 'acquisition' | 'dividend' | 'stock_split' | 'management_change' | 'regulatory' | 'other';
    eventText: string;
    confidence?: number;
    metadata?: any;
    isVerified: boolean;
    createdAt: Date;
    detectedAt: Date;
    article: NewsArticle;
    company?: Company;
}
