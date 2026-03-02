'use client';

import { useState, useEffect } from 'react';
import api, { Company } from '@/lib/api';
import { authManager } from '@/lib/auth';

interface StockData {
  company: Company;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  volume?: number;
  sentiment?: number;
  lastUpdated?: string;
}

interface WatchlistItem {
  id: string;
  userId: string;
  companyId: string;
  company: Company;
  addedAt: string;
}

export default function StockDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [stockData, setStockData] = useState<Map<string, StockData>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        if (!authManager.isAuthenticated()) {
          return;
        }

        const currentUser = authManager.getCurrentUser();
        setUser(currentUser);

        // Fetch companies
        const companiesData = await api.getCompanies();
        setCompanies(companiesData);

        // Fetch user's watchlist
        await fetchWatchlist();

        setLoading(false);
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const watchlistData = await api.getUserWatchlist();
      setWatchlist(watchlistData);
      
      // Fetch stock data for watchlist items
      for (const item of watchlistData) {
        const data = await fetchStockData(item.companyId);
        if (data) {
          setStockData(prev => new Map(prev.set(item.companyId, data)));
        }
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  const fetchStockData = async (companyId: string): Promise<StockData | null> => {
    try {
      const company = await api.getCompany(companyId);
      const sentiment = await api.getCompanySentiment(companyId, 24);
      const recentNews = await api.getCompanyNews(companyId, { hours: 24, limit: 5 });
      
      return {
        company,
        sentiment: sentiment.avgSentiment,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error fetching stock data for ${companyId}:`, error);
      return null;
    }
  };

  const addToWatchlist = async (company: Company) => {
    try {
      await api.addToWatchlist(company.id);
      await fetchWatchlist();
      setShowAddModal(false);
      setSelectedCompany(null);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const removeFromWatchlist = async (companyId: string) => {
    try {
      await api.removeFromWatchlist(companyId);
      await fetchWatchlist();
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'all' || company.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const sectors = Array.from(new Set(companies.map(c => c.sector)));

  const getSentimentColor = (sentiment?: number) => {
    if (!sentiment) return 'text-gray-500';
    if (sentiment > 0.1) return 'text-green-600';
    if (sentiment < -0.1) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSentimentIcon = (sentiment?: number) => {
    if (!sentiment) return '➖';
    if (sentiment > 0.1) return '📈';
    if (sentiment < -0.1) return '📉';
    return '➡️';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">NSE Stock Dashboard</h1>
              <p className="text-sm text-gray-600">Track and analyze Nairobi Stock Exchange companies</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                Add Stock
              </button>
              <div className="text-sm text-gray-600">
                Welcome, {user?.displayName || user?.username}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Watchlist Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Watchlist</h2>
          {watchlist.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="text-gray-500 mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stocks in watchlist</h3>
              <p className="text-gray-600 mb-4">Start tracking NSE stocks by adding them to your watchlist</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                Add Your First Stock
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchlist.map((item) => {
                const stockInfo = stockData.get(item.companyId);
                return (
                  <div key={item.id} className="card p-4 hover:card-hover">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.company.name}</h3>
                        <p className="text-sm text-gray-600">{item.company.ticker}</p>
                      </div>
                      <button
                        onClick={() => removeFromWatchlist(item.companyId)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Sector:</span>
                        <span className="text-sm font-medium">{item.company.sector}</span>
                      </div>
                      
                      {stockInfo?.sentiment !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Sentiment:</span>
                          <span className={`text-sm font-medium ${getSentimentColor(stockInfo.sentiment)}`}>
                            {getSentimentIcon(stockInfo.sentiment)} {(stockInfo.sentiment * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                      
                      <div className="pt-2 border-t">
                        <button
                          onClick={() => {/* Navigate to company details */}}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Market Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Total Companies</h3>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            </div>
            <div className="card p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Sectors</h3>
              <p className="text-2xl font-bold text-gray-900">{sectors.length}</p>
            </div>
            <div className="card p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-1">In Your Watchlist</h3>
              <p className="text-2xl font-bold text-gray-900">{watchlist.length}</p>
            </div>
          </div>
        </div>

        {/* Trending Stocks */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Trending Stocks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {companies.slice(0, 8).map((company) => (
              <div key={company.id} className="card p-4 hover:card-hover cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{company.name}</h4>
                    <p className="text-sm text-gray-600">{company.ticker}</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    {company.sector}
                  </span>
                </div>
                <button
                  onClick={() => addToWatchlist(company)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Add to Watchlist
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Stock to Watchlist</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedCompany(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Search and Filter */}
            <div className="mb-4 space-y-3">
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
              
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="input"
              >
                <option value="all">All Sectors</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            {/* Company List */}
            <div className="max-h-64 overflow-y-auto mb-4">
              {filteredCompanies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => setSelectedCompany(company)}
                  className={`p-3 border rounded cursor-pointer mb-2 ${
                    selectedCompany?.id === company.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{company.name}</h4>
                      <p className="text-sm text-gray-600">{company.ticker} • {company.sector}</p>
                    </div>
                    {selectedCompany?.id === company.id && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedCompany(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedCompany && addToWatchlist(selectedCompany)}
                disabled={!selectedCompany}
                className="btn btn-primary disabled:opacity-50"
              >
                Add to Watchlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
