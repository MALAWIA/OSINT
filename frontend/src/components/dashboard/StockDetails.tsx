'use client';

import { useState, useEffect } from 'react';
import api, { Company, NewsArticle } from '@/lib/api';

interface StockDetailsProps {
  companyId: string;
  onBack?: () => void;
}

interface PriceData {
  timestamp: string;
  price: number;
  volume?: number;
}

interface SentimentData {
  timestamp: string;
  sentiment: number;
  newsCount: number;
}

export default function StockDetails({ companyId, onBack }: StockDetailsProps) {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [sentiment, setSentiment] = useState<any>(null);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [sentimentTimeline, setSentimentTimeline] = useState<SentimentData[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'sentiment'>('overview');

  useEffect(() => {
    const fetchStockDetails = async () => {
      try {
        setLoading(true);

        // Fetch basic company info
        const companyData = await api.getCompany(companyId);
        setCompany(companyData);

        // Fetch recent news
        const newsData = await api.getCompanyNews(companyId, { hours: 72, limit: 20 });
        setNews(newsData);

        // Fetch sentiment data
        const sentimentData = await api.getCompanySentiment(companyId, 72);
        setSentiment(sentimentData);

        // Fetch sentiment timeline
        const timelineData = await api.getCompanySentimentTimeline(companyId, 7);
        setSentimentTimeline(timelineData);

        // Mock price data (in real implementation, this would come from market data API)
        const mockPriceData = generateMockPriceData();
        setPriceData(mockPriceData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching stock details:', error);
        setLoading(false);
      }
    };

    fetchStockDetails();
  }, [companyId]);

  const generateMockPriceData = (): PriceData[] => {
    const data: PriceData[] = [];
    const now = new Date();
    let basePrice = 100 + Math.random() * 50;

    for (let i = 30; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const change = (Math.random() - 0.5) * 10;
      basePrice = Math.max(basePrice + change, 10);
      
      data.push({
        timestamp: timestamp.toISOString(),
        price: parseFloat(basePrice.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000) + 100000
      });
    }

    return data;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSentimentColor = (value: number) => {
    if (value > 0.1) return 'text-green-600 bg-green-50';
    if (value < -0.1) return 'text-red-600 bg-red-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getLatestPrice = () => {
    return priceData.length > 0 ? priceData[priceData.length - 1].price : 0;
  };

  const getPriceChange = () => {
    if (priceData.length < 2) return 0;
    const latest = priceData[priceData.length - 1].price;
    const previous = priceData[priceData.length - 2].price;
    return latest - previous;
  };

  const getPriceChangePercent = () => {
    if (priceData.length < 2) return 0;
    const latest = priceData[priceData.length - 1].price;
    const previous = priceData[priceData.length - 2].price;
    return ((latest - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Company not found</h2>
          <button onClick={onBack} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const latestPrice = getLatestPrice();
  const priceChange = getPriceChange();
  const priceChangePercent = getPriceChangePercent();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            {onBack && (
              <button
                onClick={onBack}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-sm text-gray-600">{company.ticker} • {company.sector}</p>
            </div>
            <button
              onClick={() => {/* Add to watchlist */}}
              className="btn btn-primary"
            >
              + Add to Watchlist
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Price Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Current Price</h3>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(latestPrice)}</p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Daily Change</h3>
            <p className={`text-2xl font-bold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {priceChange >= 0 ? '+' : ''}{formatCurrency(priceChange)}
            </p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Daily Change %</h3>
            <p className={`text-2xl font-bold ${priceChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
            </p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Sentiment</h3>
            <p className={`text-2xl font-bold ${sentiment ? getSentimentColor(sentiment.avgSentiment).split(' ')[0] : 'text-gray-600'}`}>
              {sentiment ? `${(sentiment.avgSentiment * 100).toFixed(1)}%` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'news', 'sentiment'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Price Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price History (30 Days)</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Chart component removed</p>
              </div>
            </div>

            {/* Company Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Sector</h4>
                  <p className="text-gray-900">{company.sector}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Website</h4>
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    {company.website}
                  </a>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Market Cap</h4>
                  <p className="text-gray-900">{formatCurrency(company.marketCap || 0)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Listed Date</h4>
                  <p className="text-gray-900">{formatDate(company.listedDate)}</p>
                </div>
              </div>
              {company.description && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-1">Description</h4>
                  <p className="text-gray-900">{company.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'news' && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent News</h3>
            {news.length === 0 ? (
              <p className="text-gray-500">No recent news available</p>
            ) : (
              <div className="space-y-4">
                {news.map((article) => (
                  <div key={article.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 flex-1">{article.title}</h4>
                      {article.sentimentLabel && (
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${getSentimentColor(
                          article.sentimentLabel === 'positive' ? 0.5 : 
                          article.sentimentLabel === 'negative' ? -0.5 : 0
                        )}`}>
                          {article.sentimentLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{article.source.name}</p>
                    <p className="text-sm text-gray-500">{formatDate(article.publishedAt)}</p>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Read more →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sentiment' && (
          <div className="space-y-6">
            {/* Sentiment Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Timeline (7 Days)</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Chart component removed</p>
              </div>
            </div>

            {/* Sentiment Breakdown */}
            {sentiment && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {sentiment.positiveCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Positive Articles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {sentiment.neutralCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Neutral Articles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {sentiment.negativeCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">Negative Articles</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
