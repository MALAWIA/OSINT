import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    displayName?: string;
  }) {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  async getProfile() {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  async refreshToken() {
    const response = await this.client.post('/auth/refresh');
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/auth/logout');
    return response.data;
  }

  // Companies endpoints
  async getCompanies(params?: {
    page?: number;
    limit?: number;
    sector?: string;
    search?: string;
  }) {
    const response = await this.client.get('/companies', { params });
    return response.data;
  }

  async getCompany(id: string) {
    const response = await this.client.get(`/companies/${id}`);
    return response.data;
  }

  async getCompanyByTicker(ticker: string) {
    const response = await this.client.get(`/companies/ticker/${ticker}`);
    return response.data;
  }

  async getCompanySentiment(id: string, hours?: number) {
    const response = await this.client.get(`/companies/${id}/sentiment`, {
      params: { hours },
    });
    return response.data;
  }

  async getCompanyEvents(id: string, hours?: number) {
    const response = await this.client.get(`/companies/${id}/events`, {
      params: { hours },
    });
    return response.data;
  }

  async getCompanyNews(id: string, params?: {
    hours?: number;
    page?: number;
    limit?: number;
  }) {
    const response = await this.client.get(`/companies/${id}/news`, { params });
    return response.data;
  }

  async getCompanySentimentTimeline(id: string, days?: number) {
    const response = await this.client.get(`/companies/${id}/sentiment-timeline`, {
      params: { days },
    });
    return response.data;
  }

  async getTrendingCompanies(hours?: number, limit?: number) {
    const response = await this.client.get('/companies/trending', {
      params: { hours, limit },
    });
    return response.data;
  }

  async getTopCompaniesBySentiment(hours?: number, limit?: number) {
    const response = await this.client.get('/companies/top-sentiment', {
      params: { hours, limit },
    });
    return response.data;
  }

  async getSectors() {
    const response = await this.client.get('/companies/sectors');
    return response.data;
  }

  // News endpoints
  async getNews(params?: {
    page?: number;
    limit?: number;
    companyId?: string;
    hours?: number;
    sentiment?: string;
    search?: string;
  }) {
    const response = await this.client.get('/news', { params });
    return response.data;
  }

  async getNewsArticle(id: string) {
    const response = await this.client.get(`/news/${id}`);
    return response.data;
  }

  async getTrendingNews(hours?: number, limit?: number) {
    const response = await this.client.get('/news/trending', {
      params: { hours, limit },
    });
    return response.data;
  }

  async getNewsBySentiment(hours?: number) {
    const response = await this.client.get('/news/sentiment', {
      params: { hours },
    });
    return response.data;
  }

  async getNewsVelocity(hours?: number) {
    const response = await this.client.get('/news/velocity', {
      params: { hours },
    });
    return response.data;
  }

  async getTopSources(hours?: number, limit?: number) {
    const response = await this.client.get('/news/top-sources', {
      params: { hours, limit },
    });
    return response.data;
  }

  async getNewsSources() {
    const response = await this.client.get('/news/sources');
    return response.data;
  }

  async searchNews(query: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const response = await this.client.get('/news/search', {
      params: { q: query, ...params },
    });
    return response.data;
  }

  async getNewsWithSentiment(companyId?: string, hours?: number) {
    const response = await this.client.get('/news/with-sentiment', {
      params: { companyId, hours },
    });
    return response.data;
  }

  async getNewsStatistics(hours?: number) {
    const response = await this.client.get('/news/statistics', {
      params: { hours },
    });
    return response.data;
  }

  // Chat endpoints
  async getChannels() {
    const response = await this.client.get('/chat/channels');
    return response.data;
  }

  async getChannel(id: string) {
    const response = await this.client.get(`/chat/channels/${id}`);
    return response.data;
  }

  async createChannel(channelData: {
    name: string;
    channelType: 'stock' | 'general' | 'sector';
    description?: string;
    companyId?: string;
  }) {
    const response = await this.client.post('/chat/channels', channelData);
    return response.data;
  }

  async getChannelMessages(channelId: string, params?: {
    limit?: number;
    before?: string;
  }) {
    const response = await this.client.get(`/chat/channels/${channelId}/messages`, {
      params,
    });
    return response.data;
  }

  async createMessage(messageData: {
    channelId: string;
    content: string;
    articleId?: string;
  }) {
    const response = await this.client.post('/chat/messages', messageData);
    return response.data;
  }

  async getMessage(id: string) {
    const response = await this.client.get(`/chat/messages/${id}`);
    return response.data;
  }

  async updateMessage(id: string, content: string) {
    const response = await this.client.put(`/chat/messages/${id}`, { content });
    return response.data;
  }

  async deleteMessage(id: string) {
    const response = await this.client.delete(`/chat/messages/${id}`);
    return response.data;
  }

  async addReaction(messageId: string, reactionType: string) {
    const response = await this.client.post(`/chat/messages/${messageId}/reactions`, {
      reactionType,
    });
    return response.data;
  }

  async removeReaction(messageId: string, reactionType: string) {
    const response = await this.client.delete(`/chat/messages/${messageId}/reactions`, {
      data: { reactionType },
    });
    return response.data;
  }

  async getMessageReactions(messageId: string) {
    const response = await this.client.get(`/chat/messages/${messageId}/reactions`);
    return response.data;
  }

  async getChannelStats(channelId: string) {
    const response = await this.client.get(`/chat/channels/${channelId}/stats`);
    return response.data;
  }

  async getUserStats() {
    const response = await this.client.get('/chat/user/stats');
    return response.data;
  }

  async searchMessages(channelId: string, query: string, limit?: number) {
    const response = await this.client.get(`/chat/channels/${channelId}/search`, {
      params: { q: query, limit },
    });
    return response.data;
  }

  async getUserChannels() {
    const response = await this.client.get('/chat/user/channels');
    return response.data;
  }

  // Analytics endpoints
  async getOverview(hours?: number) {
    const response = await this.client.get('/analytics/overview', {
      params: { hours },
    });
    return response.data;
  }

  async getUserAnalytics(hours?: number) {
    const response = await this.client.get('/analytics/users', {
      params: { hours },
    });
    return response.data;
  }

  async getSentimentAnalytics(hours?: number) {
    const response = await this.client.get('/analytics/sentiment', {
      params: { hours },
    });
    return response.data;
  }

  async getTrendingAnalytics(hours?: number) {
    const response = await this.client.get('/analytics/trending', {
      params: { hours },
    });
    return response.data;
  }

  async getModerationAnalytics(hours?: number) {
    const response = await this.client.get('/analytics/moderation', {
      params: { hours },
    });
    return response.data;
  }

  async getEngagementAnalytics(hours?: number) {
    const response = await this.client.get('/analytics/engagement', {
      params: { hours },
    });
    return response.data;
  }

  async getHealthMetrics() {
    const response = await this.client.get('/analytics/health');
    return response.data;
  }

  // Watchlist endpoints
  async getUserWatchlist() {
    const response = await this.client.get('/watchlist');
    return response.data;
  }

  async addToWatchlist(companyId: string) {
    const response = await this.client.post('/watchlist', { companyId });
    return response.data;
  }

  async removeFromWatchlist(companyId: string) {
    const response = await this.client.delete(`/watchlist/${companyId}`);
    return response.data;
  }

  async getWatchlistItem(companyId: string) {
    const response = await this.client.get(`/watchlist/${companyId}`);
    return response.data;
  }
}

// Create singleton instance
const api = new ApiClient();
export default api;

// Export types for better TypeScript support
export interface ApiResponse<T = any> {
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  isVerified: boolean;
  isModerator: boolean;
  isAdmin: boolean;
  reputationScore: number;
  createdAt: string;
  lastActive: string;
}

export interface Company {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  description: string;
  website: string;
  listedDate: string;
  marketCap: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  rawText: string;
  publishedAt: string;
  fetchedAt: string;
  source: {
    id: string;
    name: string;
    url: string;
  };
  avgSentiment?: number;
  sentimentLabel?: string;
}

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  articleId?: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  user: User;
  article?: NewsArticle;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  reactionType: string;
  createdAt: string;
  user: User;
}

export interface DiscussionChannel {
  id: string;
  name: string;
  channelType: 'stock' | 'general' | 'sector';
  companyId?: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  company?: Company;
}
