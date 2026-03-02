import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ui/ThemeToggle';
import HoverPreview from '@/components/ui/HoverPreview';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  };

  // Authentication guard for feature access
  const requireAuth = (route: string) => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push(`/login?redirect=${encodeURIComponent(route)}`);
      return false;
    }
    router.push(route);
    return true;
  };

  // Handle button clicks with auth check
  const handleFeatureClick = (route: string) => {
    requireAuth(route);
  };

  const featurePreviews = {
    news: {
      title: 'Market News',
      description: 'Real-time NSE news and market intelligence',
      essence: 'Stay informed with breaking news, company announcements, and market-moving events that impact your investment decisions.',
      features: ['Breaking news alerts', 'Company announcements', 'Market analysis', 'Economic indicators'],
      route: '/news'
    },
    sentiment: {
      title: 'Sentiment Analysis',
      description: 'AI-powered market sentiment tracking',
      essence: 'Gauge market mood through advanced sentiment analysis, helping you understand investor psychology and market trends.',
      features: ['Real-time sentiment scores', 'Trend analysis', 'Social media insights', 'Predictive analytics'],
      route: '/sentiment'
    },
    discussions: {
      title: 'Market Discussions',
      description: 'Community-driven trading insights',
      essence: 'Connect with fellow traders, share strategies, and gain collective wisdom from the NSE trading community.',
      features: ['Trader discussions', 'Market predictions', 'Strategy sharing', 'Expert analysis'],
      route: '/chat'
    },
    groups: {
      title: 'Trading Groups',
      description: 'Collaborative investment communities',
      essence: 'Join focused trading communities for collaborative research, idea sharing, and coordinated investment strategies.',
      features: ['Private groups (20 max)', 'Public communities (200 max)', 'Admin management', 'Topic-focused discussions'],
      route: '/groups'
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Header with Auth Buttons */}
      <div className="absolute top-8 right-8 z-20 flex gap-4">
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          🔐 Login
        </button>
        <button
          onClick={() => router.push('/signup')}
          className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          📝 Sign Up
        </button>
        <ThemeToggle />
      </div>

      {/* Center - NSE Stock with Linear Functionality */}
      <div className="flex flex-col items-center justify-center min-h-screen relative z-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-financial text-gray-900 dark:text-white mb-4">NSE Intelligence Platform</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Nairobi Stock Exchange Market Analysis</p>

          {/* Main NSE Stock Button */}
          <button
            onClick={() => handleFeatureClick('/stocks')}
            className="px-16 py-8 bg-blue-600 dark:bg-blue-700 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-300 font-bold text-xl font-financial shadow-2xl hover:shadow-3xl transform hover:scale-110 hover:-translate-y-2"
          >
            📈 NSE Stocks
          </button>

          {/* Linear Functionality Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {/* News */}
            <button
              onClick={() => handleFeatureClick('/news')}
              className="px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-all duration-300 font-medium font-financial shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              📰 News
            </button>

            {/* Sentiment Analysis */}
            <button
              onClick={() => handleFeatureClick('/sentiment')}
              className="px-6 py-3 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-800 transition-all duration-300 font-medium font-financial shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              📊 Sentiment
            </button>

            {/* Discussions */}
            <button
              onClick={() => handleFeatureClick('/chat')}
              className="px-6 py-3 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-800 transition-all duration-300 font-medium font-financial shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              💬 Discussions
            </button>

            {/* Groups */}
            <button
              onClick={() => handleFeatureClick('/groups')}
              className="px-6 py-3 bg-teal-600 dark:bg-teal-700 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-800 transition-all duration-300 font-medium font-financial shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              👥 Groups
            </button>

            {/* Notifications */}
            <button
              onClick={() => handleFeatureClick('/notifications')}
              className="px-6 py-3 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-all duration-300 font-medium font-financial shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🔔 Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
