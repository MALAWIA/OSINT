'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authManager } from '@/lib/auth';
import api from '@/lib/api';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'news' | 'companies' | 'sentiment' | 'stocks'>('news');
  const [filters, setFilters] = useState({
    sentiment: '',
    companyId: '',
    search: '',
  });
  const router = useRouter();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        console.log('Dashboard: Initializing...');
        
        // Initialize auth manager first
        authManager.initialize();
        console.log('Dashboard: Auth initialized');
        
        // Check authentication immediately
        const isAuth = authManager.isAuthenticated();
        console.log('Dashboard: Is authenticated?', isAuth);
        
        if (!isAuth) {
          console.log('Dashboard: Not authenticated, redirecting to login');
          router.push('/login');
          return;
        }

        // Get current user
        const currentUser = authManager.getCurrentUser();
        console.log('Dashboard: Current user:', currentUser);
        
        if (!currentUser) {
          console.log('Dashboard: No user found, redirecting to login');
          router.push('/login');
          return;
        }
        
        setUser(currentUser);
        setLoading(false);
        console.log('Dashboard: Successfully initialized');
      } catch (error) {
        console.error('Dashboard initialization error:', error);
        router.push('/login');
      }
    };

    initializeDashboard();
  }, [router]);

  const handleLogout = async () => {
    try {
      authManager.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">NSE Intelligence</h1>
              <span className="ml-4 text-sm text-gray-500">Platform Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.displayName || user.username}</p>
                <p className="text-xs text-gray-500">
                  {user.isAdmin ? 'Admin' : user.isModerator ? 'Moderator' : 'User'}
                </p>
              </div>
              
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'news', label: 'News Feed', icon: '📰' },
              { id: 'companies', label: 'Companies', icon: '📊' },
              { id: 'sentiment', label: 'Sentiment', icon: '📈' },
              { id: 'stocks', label: 'Stock Tracker', icon: '💹' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters for News Tab */}
        {activeTab === 'news' && (
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search news..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sentiment</label>
                <select
                  value={filters.sentiment}
                  onChange={(e) => setFilters(prev => ({ ...prev, sentiment: e.target.value }))}
                  className="input"
                >
                  <option value="">All</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <select
                  value={filters.companyId}
                  onChange={(e) => setFilters(prev => ({ ...prev, companyId: e.target.value }))}
                  className="input"
                >
                  <option value="">All Companies</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'news' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">News Feed</h3>
                  <p className="text-gray-600 mb-4">Latest market news and analysis</p>
                  <button
                    onClick={() => router.push('/news')}
                    className="btn btn-primary"
                  >
                    Open News →
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'companies' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Trending Companies</h3>
                  <p className="text-gray-600 mb-4">Top performing NSE companies</p>
                  <button
                    onClick={() => router.push('/stocks')}
                    className="btn btn-primary"
                  >
                    Open Stocks →
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'sentiment' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sentiment Analysis</h3>
                  <p className="text-gray-600 mb-4">Market sentiment trends and insights</p>
                  <button
                    onClick={() => router.push('/sentiment')}
                    className="btn btn-primary"
                  >
                    Open Sentiment →
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'stocks' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Stock Tracker</h3>
                  <p className="text-gray-600 mb-4">Track your favorite NSE stocks and monitor their performance</p>
                  <button
                    onClick={() => router.push('/stocks')}
                    className="btn btn-primary"
                  >
                    Open Stock Dashboard →
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Active Users</span>
                  <span className="text-sm font-medium text-gray-900">1,234</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">News Articles</span>
                  <span className="text-sm font-medium text-gray-900">5,678</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Companies Tracked</span>
                  <span className="text-sm font-medium text-gray-900">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Sentiment Score</span>
                  <span className="text-sm font-medium text-green-600">+0.12</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">New earnings report for SCOM</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">Positive sentiment spike in banking sector</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-900">KCB announces new digital initiative</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Trending Topics</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Digital Banking</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Earnings</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Regulation</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">M&A Activity</span>
                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full">Market Volatility</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
