'use client';

import { useState, useEffect } from 'react';

// Mock NSE stock data
const mockCompanies = [
  {
    id: '1',
    name: 'Safaricom PLC',
    ticker: 'SCOM',
    sector: 'Telecommunications',
    industry: 'Mobile Telecommunications',
    description: 'Leading telecommunications company in Kenya',
    marketCap: 1030000000000,
    employees: 6500,
    website: 'https://www.safaricom.co.ke',
    isActive: true
  },
  {
    id: '2',
    name: 'Equity Group Holdings PLC',
    ticker: 'EQTY',
    sector: 'Banking',
    industry: 'Banking',
    description: 'Largest banking group in Kenya by assets',
    marketCap: 158000000000,
    employees: 12000,
    website: 'https://www.equitygroup.co.ke',
    isActive: true
  },
  {
    id: '3',
    name: 'KCB Group PLC',
    ticker: 'KCB',
    sector: 'Banking',
    industry: 'Banking',
    description: 'One of the largest commercial banks in Kenya',
    marketCap: 145000000000,
    employees: 8500,
    website: 'https://www.kcbgroup.com',
    isActive: true
  },
  {
    id: '4',
    name: 'Co-operative Bank of Kenya',
    ticker: 'COOP',
    sector: 'Banking',
    industry: 'Banking',
    description: 'Leading cooperative bank in Kenya',
    marketCap: 95000000000,
    employees: 6000,
    website: 'https://www.co-opbank.co.ke',
    isActive: true
  },
  {
    id: '5',
    name: 'East African Breweries Limited',
    ticker: 'EABL',
    sector: 'Consumer Goods',
    industry: 'Beverages',
    description: 'Leading brewing company in East Africa',
    marketCap: 285000000000,
    employees: 1500,
    website: 'https://www.eabl.com',
    isActive: true
  },
  {
    id: '6',
    name: 'British American Tobacco Kenya',
    ticker: 'BAT',
    sector: 'Consumer Goods',
    industry: 'Tobacco',
    description: 'Leading tobacco company in Kenya',
    marketCap: 116000000000,
    employees: 800,
    website: 'https://www.bat.com',
    isActive: true
  },
  {
    id: '7',
    name: 'Kenya Power and Lighting Company',
    ticker: 'KPLC',
    sector: 'Energy',
    industry: 'Electricity',
    description: 'Primary electricity provider in Kenya',
    marketCap: 85000000000,
    employees: 8000,
    website: 'https://www.kplc.co.ke',
    isActive: true
  },
  {
    id: '8',
    name: 'Kenya Airways',
    ticker: 'KA',
    sector: 'Transportation',
    industry: 'Aviation',
    description: 'National flag carrier of Kenya',
    marketCap: 45000000000,
    employees: 4000,
    website: 'https://www.kenya-airways.com',
    isActive: true
  }
];

const mockStockData = new Map([
  ['1', {
    currentPrice: 25.75,
    change: -0.75,
    changePercent: -2.94,
    volume: 1850000,
    sentiment: 0.15,
    lastUpdated: new Date().toISOString()
  }],
  ['2', {
    currentPrice: 42.25,
    change: 0.50,
    changePercent: 1.20,
    volume: 980000,
    sentiment: 0.25,
    lastUpdated: new Date().toISOString()
  }],
  ['3', {
    currentPrice: 38.90,
    change: 0.65,
    changePercent: 1.70,
    volume: 1200000,
    sentiment: 0.10,
    lastUpdated: new Date().toISOString()
  }],
  ['4', {
    currentPrice: 13.45,
    change: 0.25,
    changePercent: 1.89,
    volume: 2100000,
    sentiment: 0.05,
    lastUpdated: new Date().toISOString()
  }],
  ['5', {
    currentPrice: 178.50,
    change: 2.50,
    changePercent: 1.42,
    volume: 450000,
    sentiment: 0.30,
    lastUpdated: new Date().toISOString()
  }],
  ['6', {
    currentPrice: 580.00,
    change: 5.00,
    changePercent: 0.87,
    volume: 12000,
    sentiment: -0.10,
    lastUpdated: new Date().toISOString()
  }],
  ['7', {
    currentPrice: 2.85,
    change: -0.15,
    changePercent: -5.00,
    volume: 3500000,
    sentiment: -0.20,
    lastUpdated: new Date().toISOString()
  }],
  ['8', {
    currentPrice: 12.30,
    change: 0.45,
    changePercent: 3.80,
    volume: 890000,
    sentiment: 0.20,
    lastUpdated: new Date().toISOString()
  }]
]);

const mockWatchlist = [
  {
    id: 'w1',
    userId: 'demo-user',
    companyId: '1',
    company: mockCompanies[0],
    addedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'w2',
    userId: 'demo-user',
    companyId: '3',
    company: mockCompanies[2],
    addedAt: '2024-01-20T14:15:00Z'
  },
  {
    id: 'w3',
    userId: 'demo-user',
    companyId: '5',
    company: mockCompanies[4],
    addedAt: '2024-02-01T09:45:00Z'
  }
];

const mockPortfolio = [
  {
    id: 'p1',
    userId: 'demo-user',
    companyId: '1',
    company: mockCompanies[0],
    quantity: 100,
    averagePrice: 24.50,
    currentPrice: 25.75,
    currentValue: 2575.00,
    totalCost: 2450.00,
    unrealizedPnL: 125.00,
    unrealizedPnLPercent: 5.10,
    addedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'p2',
    userId: 'demo-user',
    companyId: '3',
    company: mockCompanies[2],
    quantity: 50,
    averagePrice: 36.00,
    currentPrice: 38.90,
    currentValue: 1945.00,
    totalCost: 1800.00,
    unrealizedPnL: 145.00,
    unrealizedPnLPercent: 8.06,
    addedAt: '2024-01-20T14:15:00Z'
  }
];

export default function StockDashboardMock() {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState(mockCompanies);
  const [watchlist, setWatchlist] = useState(mockWatchlist);
  const [portfolio, setPortfolio] = useState(mockPortfolio);
  const [stockData, setStockData] = useState(mockStockData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addToWatchlist = (company) => {
    const newWatchlistItem = {
      id: `w${Date.now()}`,
      userId: 'demo-user',
      companyId: company.id,
      company: company,
      addedAt: new Date().toISOString()
    };
    
    setWatchlist([...watchlist, newWatchlistItem]);
    setShowAddModal(false);
    setSelectedCompany(null);
  };

  const removeFromWatchlist = (companyId) => {
    setWatchlist(watchlist.filter(item => item.companyId !== companyId));
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'all' || company.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const sectors = Array.from(new Set(companies.map(c => c.sector)));

  const getSentimentColor = (sentiment) => {
    if (!sentiment) return 'text-gray-500';
    if (sentiment > 0.1) return 'text-green-600';
    if (sentiment < -0.1) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSentimentIcon = (sentiment) => {
    if (!sentiment) return '➖';
    if (sentiment > 0.1) return '📈';
    if (sentiment < -0.1) return '📉';
    return '➡️';
  };

  const topGainers = companies
    .map(company => {
      const data = stockData.get(company.id);
      return data ? { ...company, ...data } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);

  const topLosers = companies
    .map(company => {
      const data = stockData.get(company.id);
      return data ? { ...company, ...data } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5);

  const portfolioTotal = portfolio.reduce((sum, item) => sum + item.currentValue, 0);
  const portfolioCost = portfolio.reduce((sum, item) => sum + item.totalCost, 0);
  const portfolioPnL = portfolioTotal - portfolioCost;
  const portfolioPnLPercent = portfolioCost > 0 ? (portfolioPnL / portfolioCost) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="text-gray-600 text-sm mt-3">Loading stock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📈 NSE Stock Dashboard</h1>
              <p className="text-sm text-gray-600">Track and analyze Nairobi Stock Exchange companies</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Stock
              </button>
              <div className="text-sm text-gray-600">
                Demo Mode - No Login Required
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">📊 Total Companies</h3>
            <p className="text-3xl font-bold text-gray-900">{companies.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">⭐ Watchlist</h3>
            <p className="text-3xl font-bold text-blue-600">{watchlist.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">💼 Portfolio Value</h3>
            <p className="text-3xl font-bold text-green-600">KES {portfolioTotal.toLocaleString()}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">📈 Portfolio P&L</h3>
            <p className={`text-3xl font-bold ${portfolioPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioPnL >= 0 ? '+' : ''}KES {portfolioPnL.toLocaleString()}
            </p>
            <p className={`text-sm ${portfolioPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({portfolioPnLPercent.toFixed(2)}%)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">📈 Top Gainers</h3>
            <div className="space-y-3">
              {topGainers.map((stock) => (
                <div key={stock.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{stock.ticker}</div>
                    <div className="text-sm text-gray-600">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">+{stock.changePercent.toFixed(2)}%</div>
                    <div className="text-sm text-gray-600">KES {stock.currentPrice}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">📉 Top Losers</h3>
            <div className="space-y-3">
              {topLosers.map((stock) => (
                <div key={stock.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{stock.ticker}</div>
                    <div className="text-sm text-gray-600">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">{stock.changePercent.toFixed(2)}%</div>
                    <div className="text-sm text-gray-600">KES {stock.currentPrice}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">⭐ Your Watchlist</h2>
          {watchlist.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-500 mb-4 text-4xl">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stocks in watchlist</h3>
              <p className="text-gray-600 mb-4">Start tracking NSE stocks by adding them to your watchlist</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Stock
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchlist.map((item) => {
                const stockInfo = stockData.get(item.companyId);
                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.company.name}</h4>
                        <p className="text-sm text-gray-600">{item.company.ticker} • {item.company.sector}</p>
                      </div>
                      <button
                        onClick={() => removeFromWatchlist(item.companyId)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Current Price:</span>
                        <span className="font-medium">KES {stockInfo?.currentPrice || 'N/A'}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Change:</span>
                        <span className={`font-medium ${stockInfo?.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {stockInfo?.changePercent >= 0 ? '+' : ''}{stockInfo?.changePercent?.toFixed(2) || '0.00'}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Sentiment:</span>
                        <span className={`font-medium ${getSentimentColor(stockInfo?.sentiment)}`}>
                          {getSentimentIcon(stockInfo?.sentiment)} {stockInfo?.sentiment ? (stockInfo.sentiment * 100).toFixed(1) : '0.0'}%
                        </span>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
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

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">💼 Your Portfolio</h2>
          {portfolio.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-gray-500 mb-4 text-4xl">💼</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No portfolio holdings</h3>
              <p className="text-gray-600 mb-4">Start building your portfolio by adding NSE stocks</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Your First Stock
              </button>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Value</h3>
                  <p className="text-2xl font-bold text-gray-900">KES {portfolioTotal.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Cost</h3>
                  <p className="text-2xl font-bold text-gray-900">KES {portfolioCost.toLocaleString()}</p>
                </div>
                <div className={`${portfolioPnL >= 0 ? 'bg-green-50' : 'bg-red-50'} rounded-lg shadow-sm p-6`}>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total P&L</h3>
                  <p className={`text-2xl font-bold ${portfolioPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolioPnL >= 0 ? '+' : ''}KES {portfolioPnL.toLocaleString()}
                  </p>
                  <p className={`text-sm ${portfolioPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ({portfolioPnLPercent.toFixed(2)}%)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {portfolio.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{item.company.name}</div>
                        <div className="text-sm text-gray-600">{item.company.ticker} • {item.company.sector}</div>
                        <div className="text-xs text-gray-400">Qty: {item.quantity} @ KES {item.averagePrice}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Current: KES {item.currentPrice}</div>
                        <div className={`font-medium ${item.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.unrealizedPnL >= 0 ? '+' : ''}KES {item.unrealizedPnL.toLocaleString()}
                        </div>
                        <div className={`text-xs ${item.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ({item.unrealizedPnLPercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
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

            <div className="p-6">
              <div className="mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Search stocks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Sectors</option>
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

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

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedCompany(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedCompany && addToWatchlist(selectedCompany)}
                  disabled={!selectedCompany}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Add to Watchlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
