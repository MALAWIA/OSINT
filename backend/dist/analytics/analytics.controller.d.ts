import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    getOverview(hours?: string): Promise<{
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
    getUserAnalytics(hours?: string): Promise<{
        totalUsers: number;
        activeUsers: number;
        adminUsers: number;
        moderatorUsers: number;
        verifiedUsers: number;
        avgReputation: number;
        newUsers: number;
        topUsersByMessages: any[];
    }>;
    getSentimentAnalytics(hours?: string): Promise<{
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
    getTrendingAnalytics(hours?: string): Promise<{
        trendingCompanies: any[];
        trendingEvents: any[];
        topNewsSources: any[];
    }>;
    getModerationAnalytics(hours?: string): Promise<{
        flagStats: any[];
        recentFlags: import("../common/entities").ModerationFlag[];
        avgResolutionHours: number;
        totalResolved: number;
        pendingFlags: number;
    }>;
    getEngagementAnalytics(hours?: string): Promise<{
        messageActivity: any[];
        topChannels: any[];
        reactionStats: {
            messagesWithReactions: number;
            totalReactions: number;
            usersReacting: number;
        };
    }>;
    getHealthMetrics(user: any): Promise<{
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
}
