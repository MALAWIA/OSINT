import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, Minus, Eye, MessageSquare, Users, BarChart3 } from 'lucide-react';

interface SentimentAnalysis {
  symbol: string;
  overall_sentiment: string;
  sentiment_score: number;
  confidence: number;
  news_analyzed: number;
  social_mentions: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  key_topics: string[];
  last_updated: string;
  sources: string[];
}

interface SentimentHistory {
  date: string;
  sentiment_score: number;
  confidence: number;
  news_analyzed: number;
}

interface StockAnalysisProps {
  selectedSymbol?: string;
}

export default function SentimentAnalysis({ selectedSymbol }: StockAnalysisProps) {
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [history, setHistory] = useState<SentimentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState(selectedSymbol || 'SCOM');

  const fetchSentimentData = async (symbol: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch sentiment analysis
      const sentimentResponse = await axios.get(`http://localhost:8000/api/stocks/${symbol}/sentiment`);
      setSentiment(sentimentResponse.data);

      // Fetch sentiment history
      const historyResponse = await axios.get(`http://localhost:8000/api/stocks/${symbol}/sentiment/history?days=7`);
      setHistory(historyResponse.data);

    } catch (err) {
      console.error('Error fetching sentiment data:', err);
      setError('Failed to load sentiment analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStock) {
      fetchSentimentData(selectedStock);
    }
  }, [selectedStock]);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return <TrendingUp className="w-6 h-6" />;
      case 'negative': return <TrendingDown className="w-6 h-6" />;
      default: return <Minus className="w-6 h-6" />;
    }
  };

  const getSentimentBgColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'bg-green-50 border-green-200';
      case 'negative': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Analyzing market sentiment...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Analysis Unavailable</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stock Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Stock for Analysis</h3>
        <div className="flex gap-2">
          {['SCOM', 'KCB', 'EQTY', 'COOP', 'NCBA'].map((symbol) => (
            <button
              key={symbol}
              onClick={() => setSelectedStock(symbol)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStock === symbol
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      {sentiment && (
        <>
          {/* Main Sentiment Card */}
          <div className={`rounded-lg border-2 p-6 ${getSentimentBgColor(sentiment.overall_sentiment)}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getSentimentIcon(sentiment.overall_sentiment)}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {sentiment.symbol} Market Sentiment
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Last updated: {new Date(sentiment.last_updated).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className={`text-3xl font-bold ${getSentimentColor(sentiment.overall_sentiment)}`}>
                {sentiment.overall_sentiment.toUpperCase()}
              </div>
            </div>

            {/* Sentiment Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{sentiment.sentiment_score.toFixed(2)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sentiment Score</div>
                <div className="text-xs text-gray-500">(-1 to +1 scale)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{Math.round(sentiment.confidence * 100)}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
                <div className="text-xs text-gray-500">Analysis accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{sentiment.news_analyzed + sentiment.social_mentions}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Mentions</div>
                <div className="text-xs text-gray-500">Sources analyzed</div>
              </div>
            </div>

            {/* Sentiment Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Positive</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{sentiment.positive_count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {((sentiment.positive_count / (sentiment.news_analyzed + sentiment.social_mentions)) * 100).toFixed(1)}%
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Minus className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Neutral</span>
                </div>
                <div className="text-2xl font-bold text-gray-600">{sentiment.neutral_count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {((sentiment.neutral_count / (sentiment.news_analyzed + sentiment.social_mentions)) * 100).toFixed(1)}%
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-gray-900 dark:text-white">Negative</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{sentiment.negative_count}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {((sentiment.negative_count / (sentiment.news_analyzed + sentiment.social_mentions)) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Key Topics and Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Topics */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Key Topics</h3>
              </div>
              <div className="space-y-2">
                {sentiment.key_topics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sources */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sources Analyzed</h3>
              </div>
              <div className="space-y-2">
                {sentiment.sources.map((source, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">{source}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sentiment History Chart */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">7-Day Sentiment Trend</h3>
              </div>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">Sentiment trend chart would be displayed here</p>
                  <p className="text-sm text-gray-500">Showing {history.length} days of sentiment data</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!sentiment && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Stock</h3>
          <p className="text-gray-600 dark:text-gray-400">Choose a stock symbol above to view market sentiment analysis</p>
        </div>
      )}
    </div>
  );
}
