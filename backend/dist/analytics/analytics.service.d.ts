import { Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';
import { Message } from '../common/entities/message.entity';
import { NewsArticle } from '../common/entities/news-article.entity';
import { Company } from '../common/entities/company.entity';
import { SentimentAnalysis } from '../common/entities/sentiment-analysis.entity';
import { ModerationFlag } from '../common/entities/moderation-flag.entity';
import { DetectedEvent } from '../common/entities/detected-event.entity';
export declare class AnalyticsService {
    private usersRepository;
    private messagesRepository;
    private newsRepository;
    private companiesRepository;
    private sentimentRepository;
    private moderationRepository;
    private eventsRepository;
    constructor(usersRepository: Repository<User>, messagesRepository: Repository<Message>, newsRepository: Repository<NewsArticle>, companiesRepository: Repository<Company>, sentimentRepository: Repository<SentimentAnalysis>, moderationRepository: Repository<ModerationFlag>, eventsRepository: Repository<DetectedEvent>);
    getOverview(hours?: number): Promise<{
        totalUsers: number;
        activeUsers: number;
        totalMessages: number;
        totalNews: number;
        totalCompanies: number;
        pendingFlags: number;
        avgSentiment: number;
        userEngagementRate: number;
        messageVelocity: number;
        newsVelocity: number;
    }>;
    getUserAnalytics(hours?: number): Promise<{
        totalUsers: number;
        activeUsers: number;
        adminUsers: number;
        moderatorUsers: number;
        verifiedUsers: number;
        avgReputation: number;
        newUsers: number;
        topUsersByMessages: any[];
    }>;
    getSentimentAnalytics(hours?: number): Promise<{
        sentimentDistribution: {
            sentiment: any;
            count: number;
            avgScore: number;
            avgConfidence: number;
        }[];
        topPositiveCompanies: any[];
        topNegativeCompanies: any[];
        sentimentTimeline: {
            hour: any;
            avgScore: number;
            count: number;
        }[];
    }>;
    getTrendingAnalytics(hours?: number): Promise<{
        trendingCompanies: any[];
        trendingEvents: any[];
        topNewsSources: any[];
    }>;
    getModerationAnalytics(hours?: number): Promise<{
        flagStats: any[];
        recentFlags: ModerationFlag[];
        avgResolutionHours: number;
        totalResolved: number;
        pendingFlags: number;
    }>;
    getEngagementAnalytics(hours?: number): Promise<{
        messageActivity: any[];
        topChannels: any[];
        reactionStats: {
            messagesWithReactions: number;
            totalReactions: number;
            usersReacting: number;
        };
    }>;
    private getAverageSentiment;
    getHealthMetrics(): Promise<{
        databaseConnections: {
            active: number;
            idle: number;
            total: number;
        };
        recentActivity: {
            messages: number;
            news: number;
            activeUsers: number;
        };
        systemStatus: string;
    }>;
    private getDatabaseConnections;
    private getRecentActivity;
}
