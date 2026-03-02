import { NewsArticle } from './news-article.entity';
export declare class NewsSource {
    id: string;
    name: string;
    url: string;
    sourceType: 'rss' | 'api' | 'web_scraping';
    isActive: boolean;
    config?: any;
    articleCount: number;
    createdAt: Date;
    articles: NewsArticle[];
}
