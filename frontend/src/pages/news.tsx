'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { nseApi } from '@/utils/apiClient';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  source: string;
  author?: string;
  publishedAt: string;
  category?: string;
  sentiment?: number;
  relatedCompanies?: string[];
  imageUrl?: string;
  tags?: string[];
  url?: string;
}

export default function NewsPage() {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);

        // Fetch news from backend API
        const response = await nseApi.get('/news/', {
          params: {
            limit: 50,
            category: selectedCategory !== 'all' ? selectedCategory : undefined
          }
        });

        if (response.data && response.data.news) {
          setNews(response.data.news);
        }

        setLoading(false);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to load news:', error);
        setLoading(false);
      }
    };

    loadNews();
  }, [selectedCategory]);

  // Set up WebSocket for real-time news updates
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/news');

    ws.onopen = () => {
      console.log('Connected to news WebSocket');
      setIsLiveConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'news_alert') {
          // Add new news alert to the top of the list
          setNews(prevNews => [data.data, ...prevNews.slice(0, 49)]);
          setLastUpdate(new Date());
        } else if (data.type === 'subscription_confirmed') {
          console.log('News subscription confirmed');
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('News WebSocket disconnected');
      setIsLiveConnected(false);
    };

    ws.onerror = (error) => {
      console.error('News WebSocket error:', error);
      setIsLiveConnected(false);
    };

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []);

  // Auto-refresh news every 5 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await nseApi.get('/news/', {
          params: { limit: 20 }
        });

        if (response.data && response.data.news) {
          setNews(prevNews => {
            const newNews = response.data.news.filter((item: NewsItem) =>
              !prevNews.some(existing => existing.id === item.id)
            );
            return [...newNews, ...prevNews].slice(0, 100);
          });
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const categories = ['all', 'Corporate Earnings', 'Banking', 'Energy', 'Telecom', 'Manufacturing', 'Real Estate', 'Agriculture'];

  const filteredNews = news.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.2) return 'text-green-600 bg-green-50';
    if (sentiment < -0.2) return 'text-red-600 bg-red-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getSentimentLabel = (sentiment) => {
    if (sentiment > 0.2) return 'Positive';
    if (sentiment < -0.2) return 'Negative';
    return 'Neutral';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-sm mt-3">Loading latest news...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (selectedNews) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto p-6">
          <button
            onClick={() => setSelectedNews(null)}
            className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
          >
            ← Back to News
          </button>

          <article className="bg-white rounded-lg shadow-sm">
            <img
              src={selectedNews.imageUrl || 'https://via.placeholder.com/800x400/1e40af/ffffff?text=Market+News'}
              alt={selectedNews.title}
              className="w-full h-64 object-cover rounded-t-lg"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">{selectedNews.category || 'Market News'}</span>
                {selectedNews.sentiment && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(selectedNews.sentiment)}`}>
                    {getSentimentLabel(selectedNews.sentiment)}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedNews.title}</h1>

              <div className="flex items-center text-sm text-gray-600 mb-6">
                <span>By {selectedNews.author || 'Staff Writer'}</span>
                <span className="mx-2">•</span>
                <span>{selectedNews.source}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(selectedNews.publishedAt)}</span>
              </div>

              <p className="text-lg text-gray-700 mb-6">{selectedNews.summary}</p>

              {selectedNews.content && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{selectedNews.content}</p>
                </div>
              )}

              {selectedNews.relatedCompanies && selectedNews.relatedCompanies.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-600 mb-3">Related Companies</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNews.relatedCompanies.map(ticker => (
                      <span key={ticker} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {ticker}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedNews.tags && selectedNews.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-600 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedNews.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* Live Status Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              📰 Real-Time Market News
              <div className={`w-3 h-3 rounded-full ${isLiveConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </h1>
            <p className="text-gray-600">Live updates from Nairobi Stock Exchange and financial markets</p>
          </div>
          <div className="text-sm text-gray-500">
            Last update: {lastUpdate.toLocaleTimeString()}
            {isLiveConnected && <span className="text-green-600 ml-2">🔴 LIVE</span>}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search news by title, content, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="lg:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* News Feed */}
        <div className="grid gap-6">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-blue-500"
              onClick={() => setSelectedNews(item)}
            >
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-48 h-32 lg:h-auto">
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/400x200/1e40af/ffffff?text=Market+News'}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-t-lg lg:rounded-l-lg lg:rounded-t-none"
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">{item.category || 'Market News'}</span>
                      {item.sentiment && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                          {getSentimentLabel(item.sentiment)}
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(item.publishedAt)}</span>
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600">
                    {item.title}
                  </h2>

                  <p className="text-gray-700 mb-4 line-clamp-2">{item.summary}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <span>{item.source}</span>
                      {item.author && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{item.author}</span>
                        </>
                      )}
                    </div>

                    {item.relatedCompanies && item.relatedCompanies.length > 0 && (
                      <div className="flex gap-2">
                        {item.relatedCompanies.slice(0, 3).map(ticker => (
                          <span key={ticker} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {ticker}
                          </span>
                        ))}
                        {item.relatedCompanies.length > 3 && (
                          <span className="text-xs text-gray-500">+{item.relatedCompanies.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNews.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-4xl mb-4">📰</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No news found</h3>
            <p className="text-gray-600">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
