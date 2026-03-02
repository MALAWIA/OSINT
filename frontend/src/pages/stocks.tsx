import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import StockDashboardMock from '@/components/dashboard/StockDashboardMock';
import StockDetails from '@/components/dashboard/StockDetails';
import CreatePost from '@/components/chat/CreatePost';
import ChatPost from '@/components/chat/ChatPost';
import PortfolioDetails from '@/components/stocks/PortfolioDetails';
import SentimentAnalysis from '@/components/stocks/SentimentAnalysis';

// Mock chat posts for stocks discussion
const stockDiscussionPosts = [
  {
    id: 's1',
    author: 'John Kamau',
    avatar: 'JK',
    timestamp: '2024-02-10T14:30:00Z',
    content: 'Safaricom looking strong today! The Q3 results really boosted confidence. Anyone else loading up on SCOM at these levels?',
    likes: 15,
    isLiked: false,
    replies: [
      {
        id: 'sr1',
        content: 'I bought more this morning. The 5G story is just getting started.',
        author: 'Sarah M.',
        timestamp: '2024-02-10T15:45:00Z',
        likes: 5,
        isLiked: false
      }
    ]
  },
  {
    id: 's2',
    author: 'Grace Wanjiru',
    avatar: 'GW',
    timestamp: '2024-02-10T12:15:00Z',
    content: 'Banking sector rotation happening? KCB outperforming EQTY today. Thoughts on the divergence?',
    likes: 8,
    isLiked: false,
    replies: []
  }
];

export default function StocksPage() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [discussionPosts, setDiscussionPosts] = useState(stockDiscussionPosts);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'portfolio' | 'sentiment'>('dashboard');

  const handleCreatePost = (content: string) => {
    const newPost = {
      id: `s${Date.now()}`,
      author: 'You',
      avatar: 'YU',
      timestamp: new Date().toISOString(),
      content,
      likes: 0,
      isLiked: false,
      replies: []
    };
    setDiscussionPosts([newPost, ...discussionPosts]);
  };

  const handleLike = (postId: string) => {
    setDiscussionPosts(discussionPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleReply = (postId: string, content: string) => {
    const newReply = {
      id: `sr${Date.now()}`,
      content,
      author: 'You',
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false
    };

    setDiscussionPosts(discussionPosts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: [...post.replies, newReply]
        };
      }
      return post;
    }));
  };

  if (selectedCompanyId) {
    return (
      <MainLayout>
        <StockDetails
          companyId={selectedCompanyId}
          onBack={() => setSelectedCompanyId(null)}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold font-financial text-gray-900 dark:text-white mb-2">📈 NSE Stocks</h1>
            <p className="text-gray-600 dark:text-gray-300">Real-time Nairobi Stock Exchange market data and portfolio tracking</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              💬 Discussions
            </button>
            <button
              onClick={() => setActiveTab('portfolio')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'portfolio'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              💼 Portfolio
            </button>
            <button
              onClick={() => setActiveTab('sentiment')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'sentiment'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📊 Sentiment
            </button>
          </div>

        {/* Content Area */}
        {activeTab === 'dashboard' ? (
          <StockDashboardMock />
        ) : activeTab === 'portfolio' ? (
          <PortfolioDetails />
        ) : activeTab === 'sentiment' ? (
          <SentimentAnalysis />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Section - 2 columns */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <CreatePost onCreatePost={handleCreatePost} />
              </div>
              
              <div className="space-y-4">
                {discussionPosts.map((post) => (
                  <ChatPost
                    key={post.id}
                    {...post}
                    onLike={handleLike}
                    onReply={handleReply}
                  />
                ))}
              </div>

              {discussionPosts.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500 text-4xl mb-4">💬</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
                  <p className="text-gray-600">Start the conversation about NSE stocks!</p>
                </div>
              )}
            </div>

            {/* Quick Stats Sidebar - 1 column */}
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Stats</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Posts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{discussionPosts.length}</p>
                    <div>
                      <div className="text-sm font-medium">John Kamau</div>
                      <div className="text-xs text-gray-500">Bullish on SCOM</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      GW
                    </div>
                    <div>
                      <div className="text-sm font-medium">Grace Wanjiru</div>
                      <div className="text-xs text-gray-500">Banking sector</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      SM
                    </div>
                    <div>
                      <div className="text-sm font-medium">Samuel M.</div>
                      <div className="text-xs text-gray-500">Tech analyst</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Poll */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-3">📊 Quick Poll</h3>
                <p className="text-sm text-gray-700 mb-3">Which sector will lead next week?</p>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100">
                    🏦 Banking
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm hover:bg-gray-100">
                    📱 Telecom
                  </button>
                  <button className="w-full text-left px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm hover:bg-gray-100">
                    🏭 Manufacturing
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </MainLayout>
  );
}
