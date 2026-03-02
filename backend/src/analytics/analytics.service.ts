import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';
import { Message } from '../common/entities/message.entity';
import { NewsArticle } from '../common/entities/news-article.entity';
import { Company } from '../common/entities/company.entity';
import { SentimentAnalysis } from '../common/entities/sentiment-analysis.entity';
import { ModerationFlag } from '../common/entities/moderation-flag.entity';
import { DetectedEvent } from '../common/entities/detected-event.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(NewsArticle)
    private newsRepository: Repository<NewsArticle>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
    @InjectRepository(SentimentAnalysis)
    private sentimentRepository: Repository<SentimentAnalysis>,
    @InjectRepository(ModerationFlag)
    private moderationRepository: Repository<ModerationFlag>,
    @InjectRepository(DetectedEvent)
    private eventsRepository: Repository<DetectedEvent>,
  ) {}

  async getOverview(hours = 24) {
    const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      totalMessages,
      totalNews,
      totalCompanies,
      pendingFlags,
      avgSentiment,
    ] = await Promise.all([
      this.usersRepository.count(),
      this.usersRepository.count({
        where: { lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      this.messagesRepository.count({
        where: { createdAt: new Date(Date.now() - hours * 60 * 60 * 1000) },
      }),
      this.newsRepository.count({
        where: { fetchedAt: new Date(Date.now() - hours * 60 * 60 * 1000) },
      }),
      this.companiesRepository.count({ where: { isActive: true } }),
      this.moderationRepository.count({
        where: { status: 'pending' },
      }),
      this.getAverageSentiment(hours),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalMessages,
      totalNews,
      totalCompanies,
      pendingFlags,
      avgSentiment,
      userEngagementRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
      messageVelocity: totalMessages / hours,
      newsVelocity: totalNews / hours,
    };
  }

  async getUserAnalytics(hours = 24) {
    const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);

    const userStats = await this.usersRepository
      .createQueryBuilder('user')
      .select([
        'COUNT(*) as totalUsers',
        'COUNT(CASE WHEN user.lastActive >= :timeThreshold THEN 1 END) as activeUsers',
        'COUNT(CASE WHEN user.isAdmin = true THEN 1 END) as adminUsers',
        'COUNT(CASE WHEN user.isModerator = true THEN 1 END) as moderatorUsers',
        'COUNT(CASE WHEN user.isVerified = true THEN 1 END) as verifiedUsers',
        'AVG(user.reputationScore) as avgReputation',
      ])
      .where('user.createdAt >= :timeThreshold OR user.lastActive >= :timeThreshold', { timeThreshold })
      .setParameters({ timeThreshold })
      .getRawOne();

    const newUsers = await this.usersRepository.count({
      where: { createdAt: new Date(Date.now() - hours * 60 * 60 * 1000) },
    });

    const topUsersByMessages = await this.messagesRepository
      .createQueryBuilder('message')
      .leftJoin('message.user', 'user')
      .select(['user.username', 'user.displayName', 'COUNT(*) as messageCount'])
      .where('message.createdAt >= :timeThreshold', { timeThreshold })
      .groupBy('user.id, user.username, user.displayName')
      .orderBy('messageCount', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      totalUsers: parseInt(userStats.totalUsers) || 0,
      activeUsers: parseInt(userStats.activeUsers) || 0,
      adminUsers: parseInt(userStats.adminUsers) || 0,
      moderatorUsers: parseInt(userStats.moderatorUsers) || 0,
      verifiedUsers: parseInt(userStats.verifiedUsers) || 0,
      avgReputation: parseFloat(userStats.avgReputation) || 0,
      newUsers,
      topUsersByMessages: topUsersByMessages.map(user => ({
        ...user,
        messageCount: parseInt(user.messageCount) || 0,
      })),
    };
  }

  async getSentimentAnalytics(hours = 24) {
    const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);

    const sentimentDistribution = await this.sentimentRepository
      .createQueryBuilder('sentiment')
      .select([
        'sentiment.sentimentLabel',
        'COUNT(*) as count',
        'AVG(sentiment.sentimentScore) as avgScore',
        'AVG(sentiment.confidence) as avgConfidence',
      ])
      .leftJoin('sentiment.article', 'article')
      .where('article.publishedAt >= :timeThreshold', { timeThreshold })
      .groupBy('sentiment.sentimentLabel')
      .orderBy('count', 'DESC')
      .getRawMany();

    const topPositiveCompanies = await this.sentimentRepository
      .createQueryBuilder('sentiment')
      .leftJoin('sentiment.company', 'company')
      .leftJoin('sentiment.article', 'article')
      .select([
        'company.ticker',
        'company.name',
        'AVG(sentiment.sentimentScore) as avgScore',
        'COUNT(*) as articleCount',
      ])
      .where('sentiment.sentimentLabel = :positive', { positive: 'positive' })
      .andWhere('article.publishedAt >= :timeThreshold', { timeThreshold })
      .groupBy('company.id, company.ticker, company.name')
      .having('COUNT(*) >= 3')
      .orderBy('avgScore', 'DESC')
      .limit(10)
      .getRawMany();

    const topNegativeCompanies = await this.sentimentRepository
      .createQueryBuilder('sentiment')
      .leftJoin('sentiment.company', 'company')
      .leftJoin('sentiment.article', 'article')
      .select([
        'company.ticker',
        'company.name',
        'AVG(sentiment.sentimentScore) as avgScore',
        'COUNT(*) as articleCount',
      ])
      .where('sentiment.sentimentLabel = :negative', { negative: 'negative' })
      .andWhere('article.publishedAt >= :timeThreshold', { timeThreshold })
      .groupBy('company.id, company.ticker, company.name')
      .having('COUNT(*) >= 3')
      .orderBy('avgScore', 'ASC')
      .limit(10)
      .getRawMany();

    const sentimentTimeline = await this.sentimentRepository
      .createQueryBuilder('sentiment')
      .leftJoin('sentiment.article', 'article')
      .select([
        'DATE_TRUNC(\'hour\', article.publishedAt) as hour',
        'AVG(sentiment.sentimentScore) as avgScore',
        'COUNT(*) as count',
      ])
      .where('article.publishedAt >= :timeThreshold', { timeThreshold })
      .groupBy('DATE_TRUNC(\'hour\', article.publishedAt)')
      .orderBy('hour', 'ASC')
      .getRawMany();

    return {
      sentimentDistribution: sentimentDistribution.map(item => ({
        sentiment: item.sentimentLabel,
        count: parseInt(item.count) || 0,
        avgScore: parseFloat(item.avgScore) || 0,
        avgConfidence: parseFloat(item.avgConfidence) || 0,
      })),
      topPositiveCompanies: topPositiveCompanies.map(company => ({
        ...company,
        avgScore: parseFloat(company.avgScore) || 0,
        articleCount: parseInt(company.articleCount) || 0,
      })),
      topNegativeCompanies: topNegativeCompanies.map(company => ({
        ...company,
        avgScore: parseFloat(company.avgScore) || 0,
        articleCount: parseInt(company.articleCount) || 0,
      })),
      sentimentTimeline: sentimentTimeline.map(item => ({
        hour: item.hour,
        avgScore: parseFloat(item.avgScore) || 0,
        count: parseInt(item.count) || 0,
      })),
    };
  }

  async getTrendingAnalytics(hours = 24) {
    const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);

    const trendingCompanies = await this.newsRepository
      .createQueryBuilder('news')
      .leftJoin('news.mentions', 'mentions')
      .leftJoin('mentions.company', 'company')
      .select([
        'company.ticker',
        'company.name',
        'COUNT(DISTINCT news.id) as mentionCount',
        'COUNT(DISTINCT mentions.id) as totalMentions',
      ])
      .where('news.publishedAt >= :timeThreshold', { timeThreshold })
      .groupBy('company.id, company.ticker, company.name')
      .having('COUNT(DISTINCT news.id) > 0')
      .orderBy('mentionCount', 'DESC')
      .limit(20)
      .getRawMany();

    const trendingEvents = await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoin('event.company', 'company')
      .leftJoin('event.article', 'article')
      .select([
        'event.eventType',
        'company.ticker',
        'company.name',
        'COUNT(*) as eventCount',
        'AVG(event.confidence) as avgConfidence',
      ])
      .where('event.detectedAt >= :timeThreshold', { timeThreshold })
      .groupBy('event.eventType, company.id, company.ticker, company.name')
      .having('COUNT(*) >= 2')
      .orderBy('eventCount', 'DESC')
      .limit(15)
      .getRawMany();

    const topNewsSources = await this.newsRepository
      .createQueryBuilder('news')
      .leftJoin('news.source', 'source')
      .select([
        'source.name',
        'COUNT(*) as articleCount',
        'COUNT(DISTINCT news.id) as uniqueArticles',
      ])
      .where('news.publishedAt >= :timeThreshold', { timeThreshold })
      .groupBy('source.id, source.name')
      .orderBy('articleCount', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      trendingCompanies: trendingCompanies.map(company => ({
        ...company,
        mentionCount: parseInt(company.mentionCount) || 0,
        totalMentions: parseInt(company.totalMentions) || 0,
      })),
      trendingEvents: trendingEvents.map(event => ({
        ...event,
        eventCount: parseInt(event.eventCount) || 0,
        avgConfidence: parseFloat(event.avgConfidence) || 0,
      })),
      topNewsSources: topNewsSources.map(source => ({
        ...source,
        articleCount: parseInt(source.articleCount) || 0,
        uniqueArticles: parseInt(source.uniqueArticles) || 0,
      })),
    };
  }

  async getModerationAnalytics(hours = 24) {
    const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);

    const flagStats = await this.moderationRepository
      .createQueryBuilder('flag')
      .select([
        'flag.status',
        'flag.reason',
        'COUNT(*) as count',
      ])
      .where('flag.createdAt >= :timeThreshold', { timeThreshold })
      .groupBy('flag.status, flag.reason')
      .orderBy('count', 'DESC')
      .getRawMany();

    const recentFlags = await this.moderationRepository.find({
      where: { createdAt: new Date(Date.now() - hours * 60 * 60 * 1000) },
      relations: ['flagger', 'targetUser'],
      order: { createdAt: 'DESC' },
      take: 20,
    });

    const resolutionTime = await this.moderationRepository
      .createQueryBuilder('flag')
      .select([
        'AVG(EXTRACT(EPOCH FROM (flag.resolvedAt - flag.createdAt))/3600) as avgHours',
        'COUNT(*) as totalResolved',
      ])
      .where('flag.status = :resolved', { resolved: 'resolved' })
      .andWhere('flag.resolvedAt IS NOT NULL')
      .andWhere('flag.createdAt >= :timeThreshold', { timeThreshold })
      .getRawOne();

    return {
      flagStats: flagStats.map(stat => ({
        ...stat,
        count: parseInt(stat.count) || 0,
      })),
      recentFlags,
      avgResolutionHours: parseFloat(resolutionTime?.avgHours) || 0,
      totalResolved: parseInt(resolutionTime?.totalResolved) || 0,
      pendingFlags: await this.moderationRepository.count({
        where: { status: 'pending' },
      }),
    };
  }

  async getEngagementAnalytics(hours = 24) {
    const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);

    const messageActivity = await this.messagesRepository
      .createQueryBuilder('message')
      .select([
        'DATE_TRUNC(\'hour\', message.createdAt) as hour',
        'COUNT(*) as messageCount',
        'COUNT(DISTINCT message.userId) as activeUsers',
      ])
      .where('message.createdAt >= :timeThreshold', { timeThreshold })
      .groupBy('DATE_TRUNC(\'hour\', message.createdAt)')
      .orderBy('hour', 'ASC')
      .getRawMany();

    const topChannels = await this.messagesRepository
      .createQueryBuilder('message')
      .leftJoin('message.channel', 'channel')
      .select([
        'channel.name',
        'COUNT(*) as messageCount',
        'COUNT(DISTINCT message.userId) as activeUsers',
      ])
      .where('message.createdAt >= :timeThreshold', { timeThreshold })
      .groupBy('channel.id, channel.name')
      .orderBy('messageCount', 'DESC')
      .limit(10)
      .getRawMany();

    const reactionStats = await this.messagesRepository
      .createQueryBuilder('message')
      .leftJoin('message.reactions', 'reaction')
      .select([
        'COUNT(DISTINCT message.id) as messagesWithReactions',
        'COUNT(reaction.id) as totalReactions',
        'COUNT(DISTINCT reaction.userId) as usersReacting',
      ])
      .where('message.createdAt >= :timeThreshold', { timeThreshold })
      .getRawOne();

    return {
      messageActivity: messageActivity.map(activity => ({
        ...activity,
        messageCount: parseInt(activity.messageCount) || 0,
        activeUsers: parseInt(activity.activeUsers) || 0,
      })),
      topChannels: topChannels.map(channel => ({
        ...channel,
        messageCount: parseInt(channel.messageCount) || 0,
        activeUsers: parseInt(channel.activeUsers) || 0,
      })),
      reactionStats: {
        messagesWithReactions: parseInt(reactionStats?.messagesWithReactions) || 0,
        totalReactions: parseInt(reactionStats?.totalReactions) || 0,
        usersReacting: parseInt(reactionStats?.usersReacting) || 0,
      },
    };
  }

  private async getAverageSentiment(hours = 24) {
    const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);

    const result = await this.sentimentRepository
      .createQueryBuilder('sentiment')
      .leftJoin('sentiment.article', 'article')
      .select(['AVG(sentiment.sentimentScore) as avgScore'])
      .where('article.publishedAt >= :timeThreshold', { timeThreshold })
      .getRawOne();

    return parseFloat(result?.avgScore) || 0;
  }

  async getHealthMetrics() {
    const [dbConnections, recentActivity] = await Promise.all([
      this.getDatabaseConnections(),
      this.getRecentActivity(),
    ]);

    return {
      databaseConnections: dbConnections,
      recentActivity,
      systemStatus: 'healthy',
    };
  }

  private async getDatabaseConnections() {
    // This would typically query the database for connection stats
    // For now, return a placeholder
    return {
      active: 1,
      idle: 4,
      total: 5,
    };
  }

  private async getRecentActivity() {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const [messages, news, users] = await Promise.all([
      this.messagesRepository.count({
        where: { createdAt: new Date(Date.now() - 5 * 60 * 1000) },
      }),
      this.newsRepository.count({
        where: { fetchedAt: new Date(Date.now() - 5 * 60 * 1000) },
      }),
      this.usersRepository.count({
        where: { lastActive: new Date(Date.now() - 5 * 60 * 1000) },
      }),
    ]);

    return {
      messages,
      news,
      activeUsers: users,
    };
  }
}
