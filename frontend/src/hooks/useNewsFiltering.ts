'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';

// Mock news data - in real app, this would come from API
const mockNewsData = [
  {
    id: 'n1',
    title: 'Safaricom Reports Strong Q3 Earnings',
    summary: 'Safaricom announced impressive Q3 results with 15% revenue growth driven by M-Pesa expansion.',
    symbol: 'SCOM',
    companyName: 'Safaricom',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    sentiment: 'positive',
    source: 'Business Daily'
  },
  {
    id: 'n2',
    title: 'Equity Group Launches Digital Banking Platform',
    summary: 'Equity Group has unveiled a new digital banking platform aimed at enhancing customer experience.',
    symbol: 'EQTY',
    companyName: 'Equity Group',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    sentiment: 'neutral',
    source: 'Capital FM'
  },
  {
    id: 'n3',
    title: 'KCB Profit Declines Amid Economic Headwinds',
    summary: 'KCB Group reported a 5% decline in quarterly profit due to increased loan provisions.',
    symbol: 'KCB',
    companyName: 'KCB Group',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    sentiment: 'negative',
    source: 'Nation Media'
  },
  {
    id: 'n4',
    title: 'East African Breweries Expands to New Markets',
    summary: 'EABL has announced expansion plans into neighboring countries with new product lines.',
    symbol: 'EABL',
    companyName: 'East African Breweries',
    timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
    sentiment: 'positive',
    source: 'Reuters'
  },
  {
    id: 'n5',
    title: 'Kenya Power Announces Tariff Changes',
    summary: 'Kenya Power has proposed new electricity tariffs effective next month.',
    symbol: 'KPLC',
    companyName: 'Kenya Power',
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    sentiment: 'neutral',
    source: 'The Standard'
  }
];

export function useNewsFiltering() {
  const { watchedStocks, addNotification, preferences } = useNotifications();

  useEffect(() => {
    if (!preferences.newsAlerts) return;

    // Filter news for watched stocks
    const relevantNews = mockNewsData.filter(news => 
      watchedStocks.some(stock => 
        stock.symbol === news.symbol || stock.companyName.toLowerCase() === news.companyName.toLowerCase()
      )
    );

    // Check for new news (in real app, this would compare with last check time)
    const checkForNewNews = () => {
      relevantNews.forEach(news => {
        // Check if news is recent (within last 24 hours)
        const newsAge = Date.now() - news.timestamp.getTime();
        const isRecent = newsAge < 24 * 60 * 60 * 1000; // 24 hours

        if (isRecent) {
          addNotification({
            symbol: news.symbol,
            companyName: news.companyName,
            type: 'news',
            title: `📰 ${news.symbol} News Alert`,
            message: `${news.title} - ${news.summary}`,
          });
        }
      });
    };

    // Initial check
    checkForNewNews();

    // Set up periodic checking (every 5 minutes)
    const interval = setInterval(checkForNewNews, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [watchedStocks, preferences.newsAlerts, addNotification]);

  return {
    filteredNews: mockNewsData.filter(news => 
      watchedStocks.some(stock => 
        stock.symbol === news.symbol || stock.companyName.toLowerCase() === news.companyName.toLowerCase()
      )
    ),
    allNews: mockNewsData
  };
}

// News filtering utility functions
export const newsFilters = {
  bySymbol: (news: any[], symbol: string) => 
    news.filter(item => item.symbol === symbol),
  
  byCompany: (news: any[], companyName: string) => 
    news.filter(item => item.companyName.toLowerCase() === companyName.toLowerCase()),
  
  bySentiment: (news: any[], sentiment: string) => 
    news.filter(item => item.sentiment === sentiment),
  
  recent: (news: any[], hours: number = 24) => 
    news.filter(item => {
      const newsAge = Date.now() - item.timestamp.getTime();
      return newsAge < hours * 60 * 60 * 1000;
    }),
  
  bySource: (news: any[], source: string) => 
    news.filter(item => item.source === source)
};
