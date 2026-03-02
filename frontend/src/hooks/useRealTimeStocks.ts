import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

interface UseRealTimeStocksOptions {
  symbols?: string[];
  enabled?: boolean;
}

export const useRealTimeStocks = ({ symbols = [], enabled = true }: UseRealTimeStocksOptions = {}) => {
  const [stockPrices, setStockPrices] = useState<Map<string, StockPrice>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  const { isConnected: wsConnected, sendMessage } = useWebSocket({
    url: `ws://localhost:8000/ws/stocks`,
    onMessage: (message) => {
      if (message.type === 'stock_update') {
        const { symbol, data } = message.data;
        setStockPrices(prev => new Map(prev.set(symbol, {
          symbol,
          ...data
        })));
      }
    },
    onConnect: () => setIsConnected(true),
    onDisconnect: () => setIsConnected(false),
  });

  // Subscribe to specific symbols when connected
  useEffect(() => {
    if (wsConnected && symbols.length > 0) {
      sendMessage({
        type: 'subscribe',
        symbols: symbols
      });
    }
  }, [wsConnected, symbols, sendMessage]);

  const getStockPrice = (symbol: string): StockPrice | undefined => {
    return stockPrices.get(symbol);
  };

  const getAllPrices = (): StockPrice[] => {
    return Array.from(stockPrices.values());
  };

  return {
    stockPrices: getAllPrices(),
    getStockPrice,
    isConnected: isConnected && wsConnected,
  };
};
