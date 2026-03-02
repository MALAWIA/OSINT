import { NewsArticle } from './news-article.entity';
import { Company } from './company.entity';
export declare class CompanyMention {
    id: string;
    articleId: string;
    companyId: string;
    mentionText: string;
    position: number;
    confidence?: number;
    isPrimary: boolean;
    createdAt: Date;
    article: NewsArticle;
    company: Company;
}
