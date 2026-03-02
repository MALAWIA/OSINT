'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface StockAlert {
  id: string;
  symbol: string;
  companyName: string;
  type: 'price_increase' | 'price_decrease' | 'news' | 'volume_spike';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  price?: number;
  changePercent?: number;
  previousPrice?: number;
}

export interface WatchedStock {
  symbol: string;
  companyName: string;
  currentPrice: number;
  previousPrice: number;
  priceChangeThreshold: number; // percentage
  lastNotified?: Date;
}

export interface NotificationPreferences {
  priceAlerts: boolean;
  newsAlerts: boolean;
  volumeAlerts: boolean;
  soundEnabled: boolean;
  desktopNotifications: boolean;
  emailNotifications: boolean;
}

interface NotificationContextType {
  notifications: StockAlert[];
  watchedStocks: WatchedStock[];
  preferences: NotificationPreferences;
  addNotification: (notification: Omit<StockAlert, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  addWatchedStock: (stock: Omit<WatchedStock, 'previousPrice'>) => void;
  removeWatchedStock: (symbol: string) => void;
  updateWatchedStockPrice: (symbol: string, newPrice: number) => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  checkPriceAlerts: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<StockAlert[]>([]);
  const [watchedStocks, setWatchedStocks] = useState<WatchedStock[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    priceAlerts: true,
    newsAlerts: true,
    volumeAlerts: false,
    soundEnabled: true,
    desktopNotifications: true,
    emailNotifications: false,
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('stockNotifications');
    const savedWatchedStocks = localStorage.getItem('watchedStocks');
    const savedPreferences = localStorage.getItem('notificationPreferences');

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
    if (savedWatchedStocks) {
      setWatchedStocks(JSON.parse(savedWatchedStocks));
    }
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('stockNotifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('watchedStocks', JSON.stringify(watchedStocks));
  }, [watchedStocks]);

  useEffect(() => {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  }, [preferences]);

  // Request desktop notification permission
  useEffect(() => {
    if (preferences.desktopNotifications && 'Notification' in window) {
      Notification.requestPermission();
    }
  }, [preferences.desktopNotifications]);

  const addNotification = (notification: Omit<StockAlert, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: StockAlert = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show desktop notification if enabled
    if (preferences.desktopNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
      });
    }

    // Play sound if enabled
    if (preferences.soundEnabled) {
      // Simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addWatchedStock = (stock: Omit<WatchedStock, 'previousPrice'>) => {
    const newStock: WatchedStock = {
      ...stock,
      previousPrice: stock.currentPrice,
    };
    setWatchedStocks(prev => [...prev, newStock]);
  };

  const removeWatchedStock = (symbol: string) => {
    setWatchedStocks(prev => prev.filter(stock => stock.symbol !== symbol));
  };

  const updateWatchedStockPrice = (symbol: string, newPrice: number) => {
    setWatchedStocks(prev =>
      prev.map(stock => {
        if (stock.symbol === symbol) {
          const previousPrice = stock.currentPrice;
          const changePercent = ((newPrice - previousPrice) / previousPrice) * 100;
          
          return {
            ...stock,
            previousPrice,
            currentPrice: newPrice,
          };
        }
        return stock;
      })
    );
  };

  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  };

  const checkPriceAlerts = () => {
    if (!preferences.priceAlerts) return;

    watchedStocks.forEach(stock => {
      const changePercent = ((stock.currentPrice - stock.previousPrice) / stock.previousPrice) * 100;
      const absChangePercent = Math.abs(changePercent);

      if (absChangePercent >= stock.priceChangeThreshold) {
        const lastNotified = stock.lastNotified ? new Date(stock.lastNotified) : new Date(0);
        const timeSinceLastNotification = Date.now() - lastNotified.getTime();
        
        // Only notify if at least 5 minutes have passed since last notification for this stock
        if (timeSinceLastNotification > 5 * 60 * 1000) {
          const alertType = changePercent > 0 ? 'price_increase' : 'price_decrease';
          
          addNotification({
            symbol: stock.symbol,
            companyName: stock.companyName,
            type: alertType,
            title: `${stock.symbol} ${changePercent > 0 ? '📈' : '📉'} ${Math.abs(changePercent).toFixed(2)}%`,
            message: `${stock.companyName} ${stock.symbol} has ${changePercent > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePercent).toFixed(2)}% to KES ${stock.currentPrice.toFixed(2)}`,
            price: stock.currentPrice,
            changePercent,
            previousPrice: stock.previousPrice,
          });

          // Update last notified time
          setWatchedStocks(prev =>
            prev.map(s =>
              s.symbol === stock.symbol ? { ...s, lastNotified: new Date() } : s
            )
          );
        }
      }
    });
  };

  // Simulate price updates every 30 seconds for demo purposes
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random price changes for watched stocks
      setWatchedStocks(prev =>
        prev.map(stock => {
          const changePercent = (Math.random() - 0.5) * 0.1; // Random change between -5% and +5%
          const newPrice = stock.currentPrice * (1 + changePercent);
          return {
            ...stock,
            previousPrice: stock.currentPrice,
            currentPrice: Math.max(newPrice, 1), // Ensure price doesn't go below 1
          };
        })
      );
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Check for price alerts whenever watched stocks update
  useEffect(() => {
    checkPriceAlerts();
  }, [watchedStocks]);

  const value: NotificationContextType = {
    notifications,
    watchedStocks,
    preferences,
    addNotification,
    markAsRead,
    clearNotifications,
    addWatchedStock,
    removeWatchedStock,
    updateWatchedStockPrice,
    updatePreferences,
    checkPriceAlerts,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
