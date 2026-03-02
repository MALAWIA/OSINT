'use client';

import { useState, useEffect } from 'react';
import { useRealTimeStocks } from '@/hooks/useRealTimeStocks';
import { nseApi } from '@/utils/apiClient';

interface MarketIndex {
  index_name: string;
  index_code: string;
  value: number;
  change_value: number;
  change_percent: number;
  volume?: number;
}

interface MarketSummary {
  total_volume: number;
  market_cap: number;
  advancers: number;
  decliners: number;
  gainers: Array<{symbol: string; change_percent: number}>;
  losers: Array<{symbol: string; change_percent: number}>;
}

export default function PortfolioDetails() {
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [marketSummary, setMarketSummary] = useState<MarketSummary | null>(null);
  const [trackedStocks, setTrackedStocks] = useState<string[]>(['EQTY', 'SCBK', 'KCB', 'DTK', 'COOP']);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Get real-time stock data
  const { stockPrices, isConnected } = useRealTimeStocks({
    symbols: trackedStocks,
    enabled: true
  });

  // Fetch market indices
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Fetch market indices
        const indicesResponse = await nseApi.get('/market/indices');
        if (indicesResponse.data) {
          setMarketIndices(indicesResponse.data);
        }

        // Fetch market summary
        const summaryResponse = await nseApi.get('/market/summary');
        if (summaryResponse.data) {
          setMarketSummary(summaryResponse.data);
        }

        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-KE').format(num);
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➡️';
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? 'Live Market Data' : 'Connecting...'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Market Indices */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Market Indices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketIndices.map((index) => (
            <div key={index.index_code} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">{index.index_name}</h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">{index.index_code}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {formatNumber(index.value)}
              </div>
              <div className={`flex items-center gap-1 text-sm ${getChangeColor(index.change_value)}`}>
                {getChangeIcon(index.change_value)}
                <span>{index.change_value > 0 ? '+' : ''}{index.change_value?.toFixed(2)}</span>
                <span>({index.change_percent > 0 ? '+' : ''}{index.change_percent?.toFixed(2)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-Time Stock Tracking */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Live Stock Tracking</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Tracking {trackedStocks.length} stocks
          </div>
        </div>

        <div className="space-y-4">
          {stockPrices.map((stock) => (
            <div key={stock.symbol} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {stock.symbol.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stock.name || 'NSE Listed Stock'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(stock.price)}
                  </div>
                  <div className={`flex items-center gap-1 text-sm justify-end ${getChangeColor(stock.changePercent)}`}>
                    {getChangeIcon(stock.changePercent)}
                    <span>{stock.changePercent > 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Volume</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {stock.volume ? formatNumber(stock.volume) : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Change</p>
                  <p className={`font-medium ${getChangeColor(stock.change)}`}>
                    {stock.change > 0 ? '+' : ''}{formatCurrency(stock.change || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">High/Low</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {stock.highPrice ? formatCurrency(stock.highPrice) : 'N/A'} / {stock.lowPrice ? formatCurrency(stock.lowPrice) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Summary */}
      {marketSummary && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Market Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatNumber(marketSummary.total_volume)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Volume</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {marketSummary.advancers}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Advancers</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {marketSummary.decliners}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Decliners</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(marketSummary.market_cap)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Market Cap</div>
            </div>
          </div>

          {/* Top Gainers & Losers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Top Gainers</h3>
              <div className="space-y-2">
                {marketSummary.gainers.slice(0, 5).map((gainer, index) => (
                  <div key={gainer.symbol} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <span className="font-medium text-green-700 dark:text-green-400">{gainer.symbol}</span>
                    <span className="text-green-600 dark:text-green-400">+{gainer.change_percent.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Top Losers</h3>
              <div className="space-y-2">
                {marketSummary.losers.slice(0, 5).map((loser, index) => (
                  <div key={loser.symbol} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <span className="font-medium text-red-700 dark:text-red-400">{loser.symbol}</span>
                    <span className="text-red-600 dark:text-red-400">{loser.change_percent.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
