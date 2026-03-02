'use client';

import { useState } from 'react';
import { useNotifications, WatchedStock } from '@/contexts/NotificationContext';

interface StockWatchlistProps {
  onStockSelect?: (stock: WatchedStock) => void;
}

export default function StockWatchlist({ onStockSelect }: StockWatchlistProps) {
  const { watchedStocks, addWatchedStock, removeWatchedStock, updatePreferences, preferences } = useNotifications();
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [newStock, setNewStock] = useState({
    symbol: '',
    companyName: '',
    currentPrice: 0,
    priceChangeThreshold: 5, // Default 5%
  });

  const handleAddStock = () => {
    if (newStock.symbol && newStock.companyName && newStock.currentPrice > 0) {
      addWatchedStock(newStock);
      setNewStock({
        symbol: '',
        companyName: '',
        currentPrice: 0,
        priceChangeThreshold: 5,
      });
      setIsAddingStock(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (current: number, previous: number) => {
    const change = current - previous;
    const changePercent = (change / previous) * 100;
    const isPositive = change >= 0;

    return {
      value: formatPrice(change),
      percent: `${isPositive ? '+' : ''}${changePercent.toFixed(2)}%`,
      isPositive,
      color: isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Stock Watchlist</h3>
          <button
            onClick={() => setIsAddingStock(true)}
            className="px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white text-sm rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            + Add Stock
          </button>
        </div>
      </div>

      {/* Add Stock Form */}
      {isAddingStock && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Symbol
                </label>
                <input
                  type="text"
                  value={newStock.symbol}
                  onChange={(e) => setNewStock(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  placeholder="e.g., SCOM"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={newStock.companyName}
                  onChange={(e) => setNewStock(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="e.g., Safaricom"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Price (KES)
                </label>
                <input
                  type="number"
                  value={newStock.currentPrice}
                  onChange={(e) => setNewStock(prev => ({ ...prev, currentPrice: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Alert Threshold (%)
                </label>
                <input
                  type="number"
                  value={newStock.priceChangeThreshold}
                  onChange={(e) => setNewStock(prev => ({ ...prev, priceChangeThreshold: parseFloat(e.target.value) || 0 }))}
                  placeholder="5"
                  step="0.5"
                  min="0.5"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddStock}
                disabled={!newStock.symbol || !newStock.companyName || newStock.currentPrice <= 0}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Stock
              </button>
              <button
                onClick={() => setIsAddingStock(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Watchlist */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {watchedStocks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No stocks in watchlist</p>
            <p className="text-sm mt-1">Add stocks to start receiving price alerts</p>
          </div>
        ) : (
          watchedStocks.map((stock) => {
            const change = formatChange(stock.currentPrice, stock.previousPrice);
            
            return (
              <div
                key={stock.symbol}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => onStockSelect?.(stock)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</h4>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{stock.companyName}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-lg font-medium text-gray-900 dark:text-white">
                        {formatPrice(stock.currentPrice)}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-medium ${change.color}`}>
                          {change.value}
                        </span>
                        <span className={`text-xs font-medium ${change.color}`}>
                          ({change.percent})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Alert: {stock.priceChangeThreshold}%
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeWatchedStock(stock.symbol);
                      }}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
