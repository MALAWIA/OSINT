import { NewsSource } from './news-source.entity';
import { CompanyMention } from './company-mention.entity';
import { SentimentAnalysis } from './sentiment-analysis.entity';
import { DetectedEvent } from './detected-event.entity';
import { Message } from './message.entity';
export declare class NewsArticle {
    id: string;
    source: NewsSource;
    title: string;
    url: string;
    rawText: string;
    publishedAt: Date;
    fetchedAt: Date;
    contentHash: string;
    isProcessed: boolean;
    mentions: CompanyMention[];
    sentimentAnalysis: SentimentAnalysis[];
    events: DetectedEvent[];
    messages: Message[];
}
