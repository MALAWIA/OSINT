'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface StockPosition {
  id: string;
  symbol: string;
  companyName: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice: number;
  lastUpdated: string;
}

export interface Portfolio {
  positions: StockPosition[];
  totalInvestment: number;
  currentValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
}

interface StockTrackingContextType {
  portfolio: Portfolio;
  addPosition: (position: Omit<StockPosition, 'id' | 'currentPrice' | 'lastUpdated'>) => void;
  removePosition: (id: string) => void;
  updatePrices: (priceUpdates: { symbol: string; price: number }[]) => void;
  getPosition: (symbol: string) => StockPosition | undefined;
  calculateProfitLoss: (position: StockPosition) => {
    profitLoss: number;
    profitLossPercentage: number;
    profitLossAmount: number;
  };
}

const StockTrackingContext = createContext<StockTrackingContextType | undefined>(undefined);

export function StockTrackingProvider({ children }: { children: ReactNode }) {
  const [portfolio, setPortfolio] = useState<Portfolio>({
    positions: [],
    totalInvestment: 0,
    currentValue: 0,
    totalProfitLoss: 0,
    totalProfitLossPercentage: 0,
  });

  // Load portfolio from localStorage on mount
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('stockPortfolio');
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio));
    }
  }, []);

  // Save portfolio to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('stockPortfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  const addPosition = (newPosition: Omit<StockPosition, 'id' | 'currentPrice' | 'lastUpdated'>) => {
    const position: StockPosition = {
      ...newPosition,
      id: Date.now().toString(),
      currentPrice: newPosition.purchasePrice,
      lastUpdated: new Date().toISOString(),
    };

    setPortfolio(prev => {
      const updatedPositions = [...prev.positions, position];
      return calculatePortfolioMetrics(updatedPositions);
    });
  };

  const removePosition = (id: string) => {
    setPortfolio(prev => {
      const updatedPositions = prev.positions.filter(p => p.id !== id);
      return calculatePortfolioMetrics(updatedPositions);
    });
  };

  const updatePrices = (priceUpdates: { symbol: string; price: number }[]) => {
    setPortfolio(prev => {
      const updatedPositions = prev.positions.map(position => {
        const priceUpdate = priceUpdates.find(update => update.symbol === position.symbol);
        if (priceUpdate) {
          return {
            ...position,
            currentPrice: priceUpdate.price,
            lastUpdated: new Date().toISOString(),
          };
        }
        return position;
      });
      return calculatePortfolioMetrics(updatedPositions);
    });
  };

  const getPosition = (symbol: string): StockPosition | undefined => {
    return portfolio.positions.find(position => position.symbol === symbol);
  };

  const calculateProfitLoss = (position: StockPosition) => {
    const profitLossAmount = (position.currentPrice - position.purchasePrice) * position.shares;
    const profitLossPercentage = ((position.currentPrice - position.purchasePrice) / position.purchasePrice) * 100;
    
    return {
      profitLoss: profitLossAmount,
      profitLossPercentage,
      profitLossAmount,
    };
  };

  const calculatePortfolioMetrics = (positions: StockPosition[]): Portfolio => {
    const totalInvestment = positions.reduce((sum, pos) => sum + (pos.purchasePrice * pos.shares), 0);
    const currentValue = positions.reduce((sum, pos) => sum + (pos.currentPrice * pos.shares), 0);
    const totalProfitLoss = currentValue - totalInvestment;
    const totalProfitLossPercentage = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

    return {
      positions,
      totalInvestment,
      currentValue,
      totalProfitLoss,
      totalProfitLossPercentage,
    };
  };

  // Simulate price updates every 30 seconds for demo purposes
  useEffect(() => {
    const interval = setInterval(() => {
      if (portfolio.positions.length > 0) {
        const priceUpdates = portfolio.positions.map(position => ({
          symbol: position.symbol,
          price: position.currentPrice * (1 + (Math.random() - 0.5) * 0.02), // Random change between -1% and +1%
        }));
        updatePrices(priceUpdates);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [portfolio.positions]);

  const value: StockTrackingContextType = {
    portfolio,
    addPosition,
    removePosition,
    updatePrices,
    getPosition,
    calculateProfitLoss,
  };

  return (
    <StockTrackingContext.Provider value={value}>
      {children}
    </StockTrackingContext.Provider>
  );
}

export function useStockTracking() {
  const context = useContext(StockTrackingContext);
  if (context === undefined) {
    throw new Error('useStockTracking must be used within a StockTrackingProvider');
  }
  return context;
}
