import { SentimentAnalysis } from './sentiment-analysis.entity';
import { CompanyMention } from './company-mention.entity';
import { DetectedEvent } from './detected-event.entity';
import { DiscussionChannel } from './discussion-channel.entity';
import { StockPrice } from './stock-price.entity';
import { CorporateAction } from './corporate-action.entity';
import { RegulatoryFeed } from './regulatory-feed.entity';
export declare class Company {
    id: string;
    ticker: string;
    name: string;
    sector: string;
    description: string;
    website: string;
    listedDate: Date;
    marketCap: number;
    isActive: boolean;
    hasRegulatoryFlag: boolean;
    createdAt: Date;
    updatedAt: Date;
    sentimentAnalysis: SentimentAnalysis[];
    mentions: CompanyMention[];
    events: DetectedEvent[];
    channels: DiscussionChannel[];
    stockPrices: StockPrice[];
    corporateActions: CorporateAction[];
    regulatoryFeeds: RegulatoryFeed[];
}
