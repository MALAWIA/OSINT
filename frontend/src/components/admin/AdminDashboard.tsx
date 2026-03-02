'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authManager } from '@/lib/auth';
import api from '@/lib/api';

interface AdminDashboardProps {}

export default function AdminDashboard({}: AdminDashboardProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sentiment' | 'moderation' | 'engagement'>('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState(24); // hours
  const router = useRouter();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Check if user is admin
        authManager.initialize();
        
        if (!authManager.isAuthenticated()) {
          router.push('/login');
          return;
        }

        const currentUser = authManager.getCurrentUser();
        if (!currentUser?.isAdmin) {
          router.push('/dashboard');
          return;
        }

        setUser(currentUser);
        await fetchAnalytics();
        setLoading(false);
      } catch (error) {
        console.error('Admin dashboard initialization error:', error);
        router.push('/dashboard');
      }
    };

    initializeDashboard();
  }, [router]);

  const fetchAnalytics = async () => {
    try {
      const data = await api.getOverview(timeRange);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [timeRange, user]);

  const handleLogout = async () => {
    try {
      await authManager.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Admin access required</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return (num * 100).toFixed(1) + '%';
  };

  const StatCard = ({ title, value, change, icon, color = 'blue' }: any) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg bg-${color}-100`}>
          <span className={`text-2xl`}>{icon}</span>
        </div>
        <div className="ml-5 w-0 flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change !== undefined && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics?.totalUsers || 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={analytics?.activeUsers || 0}
          change={analytics?.userEngagementRate ? analytics.userEngagementRate - 100 : 0}
          icon="🟢"
          color="green"
        />
        <StatCard
          title="Messages Today"
          value={analytics?.totalMessages || 0}
          icon="💬"
          color="purple"
        />
        <StatCard
          title="News Articles"
          value={analytics?.totalNews || 0}
          icon="📰"
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Health</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">System Status</span>
              <span className="text-sm font-medium text-green-600">Healthy</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Avg Sentiment</span>
              <span className="text-sm font-medium">
                {analytics?.avgSentiment ? formatPercentage(analytics.avgSentiment) : '0%'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Pending Flags</span>
              <span className="text-sm font-medium text-orange-600">
                {analytics?.pendingFlags || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Velocity</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Messages/Hour</span>
              <span className="text-sm font-medium">
                {analytics?.messageVelocity?.toFixed(1) || '0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">News/Hour</span>
              <span className="text-sm font-medium">
                {analytics?.newsVelocity?.toFixed(1) || '0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Engagement Rate</span>
              <span className="text-sm font-medium">
                {analytics?.userEngagementRate ? formatPercentage(analytics.userEngagementRate / 100) : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">User Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Users</span>
                <span className="text-sm font-medium">{analytics?.userAnalytics?.totalUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Active Users</span>
                <span className="text-sm font-medium">{analytics?.userAnalytics?.activeUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Admin Users</span>
                <span className="text-sm font-medium">{analytics?.userAnalytics?.adminUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Moderators</span>
                <span className="text-sm font-medium">{analytics?.userAnalytics?.moderatorUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Verified Users</span>
                <span className="text-sm font-medium">{analytics?.userAnalytics?.verifiedUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">New Users</span>
                <span className="text-sm font-medium text-green-600">
                  +{analytics?.userAnalytics?.newUsers || 0}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-700 mb-2">Top Users by Messages</h4>
            <div className="space-y-2">
              {analytics?.userAnalytics?.topUsersByMessages?.slice(0, 5).map((user: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{user.username}</span>
                  <span className="text-sm font-medium">{user.messageCount}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Average Reputation</h4>
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.userAnalytics?.avgReputation?.toFixed(1) || '0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSentiment = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment Analysis</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Sentiment Distribution</h4>
            <div className="space-y-3">
              {analytics?.sentimentAnalytics?.sentimentDistribution?.map((item: any) => (
                <div key={item.sentiment} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      item.sentiment === 'positive' ? 'bg-green-500' :
                      item.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-sm font-medium capitalize">{item.sentiment}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{item.count}</div>
                    <div className="text-xs text-gray-500">{formatPercentage(item.avgScore)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Top Positive Companies</h4>
            <div className="space-y-2">
              {analytics?.sentimentAnalytics?.topPositiveCompanies?.slice(0, 5).map((company: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">{company.ticker}</span>
                    <span className="text-xs text-gray-500">{company.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      {formatPercentage(company.avgScore)}
                    </div>
                    <div className="text-xs text-gray-500">{company.articleCount} articles</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Top Negative Companies</h4>
            <div className="space-y-2">
              {analytics?.sentimentAnalytics?.topNegativeCompanies?.slice(0, 5).map((company: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">{company.ticker}</span>
                    <span className="text-xs text-gray-500">{company.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-red-600">
                      {formatPercentage(company.avgScore)}
                    </div>
                    <div className="text-xs text-gray-500">{company.articleCount} articles</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Sentiment Timeline</h4>
            <div className="space-y-2">
              {analytics?.sentimentAnalytics?.sentimentTimeline?.slice(-5).map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{new Date(item.hour).toLocaleDateString()}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatPercentage(item.avgScore)}
                    </div>
                    <div className="text-xs text-gray-500">{item.count} articles</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModeration = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Moderation Analytics</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Flag Statistics</h4>
            <div className="space-y-3">
              {analytics?.moderationAnalytics?.flagStats?.map((stat: any) => (
                <div key={`${stat.status}-${stat.reason}`} className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">{stat.reason}</span>
                    <span className="text-xs text-gray-500 capitalize">{stat.status}</span>
                  </div>
                  <div className="text-sm font-medium">{stat.count}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Resolution Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Avg Resolution Time</span>
                <span className="text-sm font-medium">
                  {analytics?.moderationAnalytics?.avgResolutionHours?.toFixed(1) || '0'} hours
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Resolved</span>
                <span className="text-sm font-medium text-green-600">
                  {analytics?.moderationAnalytics?.totalResolved || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Pending Flags</span>
                <span className="text-sm font-medium text-orange-600">
                  {analytics?.moderationAnalytics?.pendingFlags || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Recent Flags</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics?.moderationAnalytics?.recentFlags?.slice(0, 10).map((flag: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flag.flagger?.displayName || flag.flagger?.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flag.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        flag.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        flag.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {flag.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(flag.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEngagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Engagement Analytics</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Message Activity</h4>
            <div className="space-y-2">
              {analytics?.engagementAnalytics?.messageActivity?.slice(-6).map((activity: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">
                    {new Date(activity.hour).toLocaleString()}
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{activity.messageCount}</div>
                    <div className="text-xs text-gray-500">{activity.activeUsers} users</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Top Channels</h4>
            <div className="space-y-2">
              {analytics?.engagementAnalytics?.topChannels?.slice(0, 5).map((channel: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{channel.name}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{channel.messageCount}</div>
                    <div className="text-xs text-gray-500">{channel.activeUsers} users</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Reaction Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Messages with Reactions</span>
                <span className="text-sm font-medium">
                  {analytics?.engagementAnalytics?.reactionStats?.messagesWithReactions || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Reactions</span>
                <span className="text-sm font-medium">
                  {analytics?.engagementAnalytics?.reactionStats?.totalReactions || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Users Reacting</span>
                <span className="text-sm font-medium">
                  {analytics?.engagementAnalytics?.reactionStats?.usersReacting || 0}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Engagement Rate</h4>
            <div className="text-2xl font-bold text-gray-900">
              {analytics?.engagementAnalytics?.reactionStats?.messagesWithReactions && analytics?.engagementAnalytics?.reactionStats.totalMessages > 0
                ? formatPercentage(analytics.engagementAnalytics.reactionStats.messagesWithReactions / analytics.engagementAnalytics.reactionStats.totalMessages)
                : '0%'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="ml-4 text-sm text-gray-500">NSE Intelligence Platform</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.displayName || user.username}</p>
                <p className="text-xs text-green-600">Administrator</p>
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
        {/* Time Range Selector */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label htmlFor="timeRange" className="text-sm font-medium text-gray-700">
                Time Range:
              </label>
              <select
                id="timeRange"
                value={timeRange}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value={1}>Last Hour</option>
                <option value={6}>Last 6 Hours</option>
                <option value={24}>Last 24 Hours</option>
                <option value={168}>Last Week</option>
              </select>
            </div>
            
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'sentiment', label: 'Sentiment', icon: '📈' },
              { id: 'moderation', label: 'Moderation', icon: '🛡️' },
              { id: 'engagement', label: 'Engagement', icon: '💬' },
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

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'sentiment' && renderSentiment()}
          {activeTab === 'moderation' && renderModeration()}
          {activeTab === 'engagement' && renderEngagement()}
        </div>
      </main>
    </div>
  );
}
