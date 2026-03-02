'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';

// Mock sentiment data
const mockSentimentData = [
  {
    id: '1',
    companyName: 'Safaricom PLC',
    ticker: 'SCOM',
    overallSentiment: 0.65,
    sentimentTrend: [0.45, 0.52, 0.58, 0.62, 0.65],
    newsCount: 24,
    positiveCount: 16,
    negativeCount: 3,
    neutralCount: 5,
    keyTopics: ['5G', 'M-Pesa', 'Earnings', 'Dividend'],
    latestNews: [
      { title: 'Strong Q3 Earnings Report', sentiment: 0.8, date: '2024-02-10' },
      { title: '5G Expansion Progress', sentiment: 0.6, date: '2024-02-08' },
      { title: 'M-Pesa Transaction Volume', sentiment: 0.7, date: '2024-02-06' }
    ]
  },
  {
    id: '2',
    companyName: 'Equity Group Holdings',
    ticker: 'EQTY',
    overallSentiment: 0.45,
    sentimentTrend: [0.38, 0.42, 0.44, 0.43, 0.45],
    newsCount: 18,
    positiveCount: 10,
    negativeCount: 4,
    neutralCount: 4,
    keyTopics: ['Digital Banking', 'SME Loans', 'Regional Expansion', 'FinTech'],
    latestNews: [
      { title: 'Digital Banking Launch', sentiment: 0.7, date: '2024-02-09' },
      { title: 'SME Loan Portfolio Growth', sentiment: 0.4, date: '2024-02-07' },
      { title: 'Regional Expansion Plans', sentiment: 0.3, date: '2024-02-05' }
    ]
  },
  {
    id: '3',
    companyName: 'KCB Group PLC',
    ticker: 'KCB',
    overallSentiment: 0.35,
    sentimentTrend: [0.42, 0.38, 0.36, 0.34, 0.35],
    newsCount: 15,
    positiveCount: 7,
    negativeCount: 5,
    neutralCount: 3,
    keyTopics: ['Partnership', 'Cross-border', 'China', 'FinTech'],
    latestNews: [
      { title: 'Chinese FinTech Partnership', sentiment: 0.5, date: '2024-02-08' },
      { title: 'Cross-border Payment Solutions', sentiment: 0.3, date: '2024-02-06' },
      { title: 'Quarterly Results', sentiment: 0.2, date: '2024-02-04' }
    ]
  },
  {
    id: '4',
    companyName: 'East African Breweries',
    ticker: 'EABL',
    overallSentiment: -0.15,
    sentimentTrend: [0.05, -0.05, -0.08, -0.12, -0.15],
    newsCount: 12,
    positiveCount: 3,
    negativeCount: 6,
    neutralCount: 3,
    keyTopics: ['Supply Chain', 'Expansion', 'Logistics', 'Challenges'],
    latestNews: [
      { title: 'Supply Chain Disruptions', sentiment: -0.4, date: '2024-02-07' },
      { title: 'Regional Expansion Plans', sentiment: 0.2, date: '2024-02-05' },
      { title: 'Logistics Investment', sentiment: -0.1, date: '2024-02-03' }
    ]
  },
  {
    id: '5',
    companyName: 'Kenya Power',
    ticker: 'KPLC',
    overallSentiment: 0.55,
    sentimentTrend: [0.48, 0.50, 0.52, 0.54, 0.55],
    newsCount: 20,
    positiveCount: 14,
    negativeCount: 3,
    neutralCount: 3,
    keyTopics: ['Renewable Energy', 'Solar', 'Wind', 'Sustainability'],
    latestNews: [
      { title: 'Renewable Energy Initiative', sentiment: 0.8, date: '2024-02-06' },
      { title: 'Solar Power Projects', sentiment: 0.6, date: '2024-02-04' },
      { title: 'Wind Farm Development', sentiment: 0.5, date: '2024-02-02' }
    ]
  }
];

const marketSentimentData = {
  overall: 0.42,
  bySector: [
    { sector: 'Telecommunications', sentiment: 0.65, change: 0.05 },
    { sector: 'Banking', sentiment: 0.40, change: -0.02 },
    { sector: 'Consumer Goods', sentiment: -0.15, change: -0.08 },
    { sector: 'Energy', sentiment: 0.55, change: 0.12 },
    { sector: 'Transportation', sentiment: 0.20, change: 0.03 }
  ],
  timeline: [
    { date: '2024-02-06', sentiment: 0.38 },
    { date: '2024-02-07', sentiment: 0.40 },
    { date: '2024-02-08', sentiment: 0.42 },
    { date: '2024-02-09', sentiment: 0.41 },
    { date: '2024-02-10', sentiment: 0.42 }
  ]
};

export default function SentimentAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [sentimentData, setSentimentData] = useState(mockSentimentData);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [viewMode, setViewMode] = useState('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (error) {
        console.error('Sentiment analysis loading error:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.2) return 'text-green-600 bg-green-50 border-green-200';
    if (sentiment < -0.2) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getSentimentLabel = (sentiment) => {
    if (sentiment > 0.2) return 'Positive';
    if (sentiment < -0.2) return 'Negative';
    return 'Neutral';
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment > 0.2) return '📈';
    if (sentiment < -0.2) return '📉';
    return '➡️';
  };

  // Function to identify negatively trending stocks
  const getNegativelyTrendingStocks = () => {
    return sentimentData.filter(stock => {
      const currentSentiment = stock.overallSentiment;
      const trend = stock.sentimentTrend;
      
      // Check if current sentiment is negative (< 0) AND trending downward
      const isNegative = currentSentiment < 0;
      const isTrendingDown = trend[trend.length - 1] < trend[0]; // Current < Previous
      
      // Also include stocks with sentiment between -0.2 and 0.2 (neutral/negative range) that are trending down
      const isWeakOrNegative = currentSentiment <= 0.2;
      
      return (isNegative || isWeakOrNegative) && isTrendingDown;
    }).sort((a, b) => a.overallSentiment - b.overallSentiment); // Sort by most negative first
  };

  // Function to calculate trend strength
  const getTrendStrength = (trend) => {
    if (trend.length < 2) return 0;
    const firstValue = trend[0];
    const lastValue = trend[trend.length - 1];
    const change = lastValue - firstValue;
    return Math.abs(change);
  };

  // Function to get trend direction
  const getTrendDirection = (trend) => {
    if (trend.length < 2) return 'stable';
    const firstValue = trend[0];
    const lastValue = trend[trend.length - 1];
    if (lastValue > firstValue) return 'up';
    if (lastValue < firstValue) return 'down';
    return 'stable';
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-sm mt-3">Analyzing sentiment data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Sentiment Analysis</h1>
          <p className="text-gray-600">Real-time sentiment analysis of NSE companies and market trends</p>
        </div>

        {/* View Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('companies')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'companies'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => setViewMode('trends')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'trends'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Trends
            </button>
            <button
              onClick={() => setViewMode('negative')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'negative'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              📉 Negative Trends
            </button>
          </div>
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Market Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Sentiment Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getSentimentColor(marketSentimentData.overall)}`}>
                    <span className="text-2xl">{getSentimentIcon(marketSentimentData.overall)}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mt-3">Overall Market</h3>
                  <p className={`text-2xl font-bold ${getSentimentColor(marketSentimentData.overall).split(' ')[0]}`}>
                    {formatPercentage(marketSentimentData.overall)}
                  </p>
                  <p className="text-sm text-gray-600">{getSentimentLabel(marketSentimentData.overall)}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">📰</div>
                  <h3 className="text-lg font-semibold text-gray-900">News Analyzed</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {sentimentData.reduce((sum, company) => sum + company.newsCount, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Last {timeRange}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🏢</div>
                  <h3 className="text-lg font-semibold text-gray-900">Companies Tracked</h3>
                  <p className="text-2xl font-bold text-green-600">{sentimentData.length}</p>
                  <p className="text-sm text-gray-600">NSE Listed</p>
                </div>
              </div>
            </div>

            {/* Sector Sentiment */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sentiment by Sector</h2>
              <div className="space-y-3">
                {marketSentimentData.bySector.map((sector) => (
                  <div key={sector.sector} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{sector.sector}</span>
                        <span className={`font-medium ${getSentimentColor(sector.sentiment).split(' ')[0]}`}>
                          {formatPercentage(sector.sentiment)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            sector.sentiment > 0.2 ? 'bg-green-500' :
                            sector.sentiment < -0.2 ? 'bg-red-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.abs(sector.sentiment) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <span className={`text-sm font-medium ${
                        sector.change > 0 ? 'text-green-600' : 
                        sector.change < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {sector.change > 0 ? '+' : ''}{formatPercentage(sector.change)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Movers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📈 Most Positive</h2>
                <div className="space-y-3">
                  {sentimentData
                    .filter(c => c.overallSentiment > 0.2)
                    .sort((a, b) => b.overallSentiment - a.overallSentiment)
                    .slice(0, 3)
                    .map((company) => (
                      <div key={company.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{company.ticker}</div>
                          <div className="text-sm text-gray-600">{company.companyName}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">{formatPercentage(company.overallSentiment)}</div>
                          <div className="text-sm text-gray-600">{company.newsCount} news</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📉 Most Negative</h2>
                <div className="space-y-3">
                  {sentimentData
                    .filter(c => c.overallSentiment < -0.2)
                    .sort((a, b) => a.overallSentiment - b.overallSentiment)
                    .slice(0, 3)
                    .map((company) => (
                      <div key={company.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{company.ticker}</div>
                          <div className="text-sm text-gray-600">{company.companyName}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-600">{formatPercentage(company.overallSentiment)}</div>
                          <div className="text-sm text-gray-600">{company.newsCount} news</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'companies' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sentimentData.map((company) => (
              <div key={company.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{company.companyName}</h3>
                    <p className="text-sm text-gray-600">{company.ticker}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full border ${getSentimentColor(company.overallSentiment)}`}>
                    <span className="font-medium">{formatPercentage(company.overallSentiment)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-green-600 font-semibold">{company.positiveCount}</div>
                    <div className="text-xs text-gray-600">Positive</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-600 font-semibold">{company.neutralCount}</div>
                    <div className="text-xs text-gray-600">Neutral</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 font-semibold">{company.negativeCount}</div>
                    <div className="text-xs text-gray-600">Negative</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {company.keyTopics.map((topic) => (
                      <span key={topic} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Latest News</h4>
                  <div className="space-y-2">
                    {company.latestNews.slice(0, 2).map((news, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-gray-900">{news.title}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className={getSentimentColor(news.sentiment).split(' ')[0]}>
                            {getSentimentLabel(news.sentiment)}
                          </span>
                          <span>•</span>
                          <span>{news.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCompany(company)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Detailed Analysis
                </button>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'trends' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Sentiment Timeline</h2>
              <div className="space-y-4">
                {marketSentimentData.timeline.map((data) => (
                  <div key={data.date} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{data.date}</div>
                      <div className="text-sm text-gray-600">Market Sentiment</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            data.sentiment > 0.2 ? 'bg-green-500' :
                            data.sentiment < -0.2 ? 'bg-red-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.abs(data.sentiment) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`font-medium ${getSentimentColor(data.sentiment).split(' ')[0]}`}>
                        {formatPercentage(data.sentiment)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Sentiment Trends</h2>
              <div className="space-y-4">
                {sentimentData.slice(0, 3).map((company) => (
                  <div key={company.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{company.companyName}</h3>
                      <span className={`font-medium ${getSentimentColor(company.overallSentiment).split(' ')[0]}`}>
                        {formatPercentage(company.overallSentiment)}
                      </span>
                    </div>
                    <div className="flex items-end gap-1 h-16">
                      {company.sentimentTrend.map((sentiment, index) => (
                        <div
                          key={index}
                          className={`flex-1 ${
                            sentiment > 0.2 ? 'bg-green-500' :
                            sentiment < -0.2 ? 'bg-red-500' : 'bg-yellow-500'
                          }`}
                          style={{ height: `${Math.abs(sentiment) * 100}%` }}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <span>5 days ago</span>
                      <span>Today</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'negative' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    📉 Negatively Trending Stocks
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Stocks showing declining sentiment trends that may indicate potential risks
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {getNegativelyTrendingStocks().length}
                  </div>
                  <div className="text-sm text-gray-600">Stocks identified</div>
                </div>
              </div>

              {getNegativelyTrendingStocks().length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Negative Trends Detected</h3>
                  <p className="text-gray-600">
                    All tracked stocks are showing stable or positive sentiment trends
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getNegativelyTrendingStocks().map((stock) => {
                    const trendStrength = getTrendStrength(stock.sentimentTrend);
                    const trendDirection = getTrendDirection(stock.sentimentTrend);
                    
                    return (
                      <div key={stock.id} className="border border-red-200 rounded-lg p-4 bg-red-50/30">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{stock.companyName}</h3>
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                {stock.ticker}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(stock.overallSentiment)}`}>
                                {getSentimentLabel(stock.overallSentiment)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 mb-3">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                  {formatPercentage(stock.overallSentiment)}
                                </div>
                                <div className="text-xs text-gray-600">Current Sentiment</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900">
                                  -{formatPercentage(trendStrength)}
                                </div>
                                <div className="text-xs text-gray-600">Trend Decline</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-semibold text-gray-900">
                                  {stock.newsCount}
                                </div>
                                <div className="text-xs text-gray-600">News Items</div>
                              </div>
                            </div>

                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">5-Day Sentiment Trend</span>
                                <span className="text-xs text-gray-500">Showing declining pattern</span>
                              </div>
                              <div className="flex items-end gap-1 h-12 bg-gray-100 rounded p-1">
                                {stock.sentimentTrend.map((sentiment, index) => (
                                  <div
                                    key={index}
                                    className={`flex-1 ${
                                      sentiment > 0.2 ? 'bg-green-500' :
                                      sentiment < -0.2 ? 'bg-red-500' : 'bg-yellow-500'
                                    }`}
                                    style={{ height: `${Math.abs(sentiment) * 100}%` }}
                                    title={`${formatPercentage(sentiment)}`}
                                  ></div>
                                ))}
                              </div>
                              <div className="flex justify-between text-xs text-gray-600 mt-1">
                                <span>5 days ago</span>
                                <span>Today</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div className="text-center p-2 bg-white rounded">
                                <div className="text-red-600 font-semibold">{stock.negativeCount}</div>
                                <div className="text-xs text-gray-600">Negative News</div>
                              </div>
                              <div className="text-center p-2 bg-white rounded">
                                <div className="text-yellow-600 font-semibold">{stock.neutralCount}</div>
                                <div className="text-xs text-gray-600">Neutral News</div>
                              </div>
                              <div className="text-center p-2 bg-white rounded">
                                <div className="text-green-600 font-semibold">{stock.positiveCount}</div>
                                <div className="text-xs text-gray-600">Positive News</div>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Key Topics (Risk Indicators)</h4>
                              <div className="flex flex-wrap gap-2">
                                {stock.keyTopics.map((topic) => (
                                  <span key={topic} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t pt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Negative News</h4>
                          <div className="space-y-2">
                            {stock.latestNews
                              .filter(news => news.sentiment < 0)
                              .slice(0, 2)
                              .map((news, index) => (
                                <div key={index} className="text-sm p-2 bg-red-50 rounded border border-red-200">
                                  <div className="font-medium text-gray-900">{news.title}</div>
                                  <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                    <span className="text-red-600 font-medium">
                                      {formatPercentage(news.sentiment)}
                                    </span>
                                    <span>•</span>
                                    <span>{news.date}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <div className="flex items-start gap-2">
                            <span className="text-yellow-600 text-lg">⚠️</span>
                            <div className="text-sm text-yellow-800">
                              <strong>Risk Analysis:</strong> This stock shows declining sentiment with {stock.negativeCount} negative news items out of {stock.newsCount} total. Consider monitoring closely or reviewing your investment strategy.
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary Statistics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Negative Trends Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {getNegativelyTrendingStocks().length}
                  </div>
                  <div className="text-sm text-gray-600">Stocks with Negative Trends</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {getNegativelyTrendingStocks().length > 0 
                      ? formatPercentage(getNegativelyTrendingStocks().reduce((sum, stock) => sum + stock.overallSentiment, 0) / getNegativelyTrendingStocks().length)
                      : '0%'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Average Sentiment</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {getNegativelyTrendingStocks().length > 0
                      ? getNegativelyTrendingStocks().reduce((sum, stock) => sum + stock.negativeCount, 0)
                      : 0
                    }
                  </div>
                  <div className="text-sm text-gray-600">Total Negative News Items</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
