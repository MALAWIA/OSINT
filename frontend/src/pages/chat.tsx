'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CreatePost from '@/components/chat/CreatePost';
import ChatPost from '@/components/chat/ChatPost';

// Mock data for posts and replies
const initialPosts = [
  {
    id: '1',
    author: 'John Kamau',
    avatar: 'JK',
    timestamp: '2024-02-10T14:30:00Z',
    content: 'Safaricom\'s Q3 results look strong! The 5G expansion is really paying off. I think we\'ll see KES 30 by end of Q2. M-Pesa growth in rural areas is the real story here - they\'re capturing market share that competitors can\'t touch.\n\nThe dividend yield is attractive too at 4.2%. What are your thoughts on SCOM\'s trajectory?',
    likes: 24,
    isLiked: false,
    replies: [
      {
        id: 'r1',
        content: 'Agreed! The rural expansion strategy is brilliant. They\'re basically creating their own market.',
        author: 'Sarah M.',
        timestamp: '2024-02-10T15:45:00Z',
        likes: 8,
        isLiked: false
      },
      {
        id: 'r2',
        content: 'I\'m more cautious about the regulatory environment. CBK might tighten mobile money rules.',
        author: 'Michael O.',
        timestamp: '2024-02-10T16:20:00Z',
        likes: 3,
        isLiked: false
      }
    ]
  },
  {
    id: '2',
    author: 'Grace Wanjiru',
    avatar: 'GW',
    timestamp: '2024-02-10T12:15:00Z',
    content: 'Banking sector is looking interesting. Equity vs KCB - who wins in 2024? \n\nEquity\'s digital push is aggressive, but KCB has the regional advantage. I\'m leaning towards KCB for long-term value, especially with their cross-border initiatives.\n\nThe China partnership could be a game-changer for trade finance. EQTY\'s valuation seems stretched at current levels though.',
    likes: 18,
    isLiked: true,
    replies: [
      {
        id: 'r3',
        content: 'KCB\'s regional diversification is definitely a strength. Less exposure to Kenya-specific risks.',
        author: 'David K.',
        timestamp: '2024-02-10T13:30:00Z',
        likes: 12,
        isLiked: true
      }
    ]
  },
  {
    id: '3',
    author: 'Peter Njoroge',
    avatar: 'PN',
    timestamp: '2024-02-10T10:45:00Z',
    content: 'EABL facing headwinds with supply chain issues, but I think this is a buying opportunity. The brand strength in East Africa is unmatched.\n\nSupply chain issues are temporary, but their market position is permanent. The Tanzania expansion is going well, and Ugandan market is stabilizing.\n\nLoading up at these levels. Long-term holders will be rewarded.',
    likes: 15,
    isLiked: false,
    replies: [
      {
        id: 'r4',
        content: 'Disagree. The competition from local brewers is intensifying. Margins will be under pressure.',
        author: 'James T.',
        timestamp: '2024-02-10T11:20:00Z',
        likes: 6,
        isLiked: false
      },
      {
        id: 'r5',
        content: 'Peter makes a good point about brand strength. EABL has pricing power that competitors lack.',
        author: 'Alice M.',
        timestamp: '2024-02-10T12:00:00Z',
        likes: 9,
        isLiked: false
      }
    ]
  },
  {
    id: '4',
    author: 'Lucy Muthoni',
    avatar: 'LM',
    timestamp: '2024-02-09T16:30:00Z',
    content: 'Kenya Power\'s renewable energy push is finally getting serious! 500MW of new capacity is significant.\n\nThis could be a turning point for KPLC. Reduced reliance on expensive thermal power will improve margins. The solar projects especially make sense given our climate.\n\nLong overdue, but better late than never. The government seems serious about energy transition.',
    likes: 31,
    isLiked: false,
    replies: [
      {
        id: 'r6',
        content: 'About time! The thermal plants have been bleeding them dry. Solar is the way forward.',
        author: 'Samuel K.',
        timestamp: '2024-02-09T17:15:00Z',
        likes: 14,
        isLiked: false
      },
      {
        id: 'r7',
        content: 'I\'ll believe it when I see it. KPLC has been making promises for years.',
        author: 'Robert W.',
        timestamp: '2024-02-09T18:00:00Z',
        likes: 4,
        isLiked: false
      }
    ]
  },
  {
    id: '5',
    author: 'Anthony Kirui',
    avatar: 'AK',
    timestamp: '2024-02-09T14:20:00Z',
    content: 'Market sentiment analysis shows interesting patterns. Tech and telecom stocks leading the rally, while consumer goods lag.\n\nThe correlation between news sentiment and stock movements is getting stronger. Real-time sentiment analysis is becoming a real edge.\n\nAnyone else tracking social media sentiment for trading signals? Been experimenting with Twitter data and getting decent results.',
    likes: 22,
    isLiked: true,
    replies: [
      {
        id: 'r8',
        content: 'Interesting approach! Which tools are you using for sentiment analysis?',
        author: 'Tech Trader',
        timestamp: '2024-02-09T15:00:00Z',
        likes: 7,
        isLiked: false
      }
    ]
  }
];

export default function ChatPage() {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [filter, setFilter] = useState<'all' | 'following'>('all');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (error) {
        console.error('Error loading posts:', error);
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleCreatePost = (content: string) => {
    const newPost = {
      id: Date.now().toString(),
      author: 'You',
      avatar: 'YU',
      timestamp: new Date().toISOString(),
      content,
      likes: 0,
      isLiked: false,
      replies: []
    };
    setPosts([newPost, ...posts]);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
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
      id: `r${Date.now()}`,
      content,
      author: 'You',
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          replies: [...post.replies, newReply]
        };
      }
      return post;
    }));
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.likes - a.likes;
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-sm mt-3">Loading market discussions...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💬 Market Discussions</h1>
          <p className="text-gray-600">Share your insights and learn from fellow investors</p>
        </div>

        {/* Create Post */}
        <CreatePost onCreatePost={handleCreatePost} />

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => setFilter('following')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'following'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Following
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'latest'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                sortBy === 'popular'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Popular
            </button>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          {sortedPosts.map((post) => (
            <ChatPost
              key={post.id}
              {...post}
              onLike={handleLike}
              onReply={handleReply}
            />
          ))}
        </div>

        {sortedPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-4xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600">Be the first to share your market insights!</p>
          </div>
        )}

        {/* Community Guidelines */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Community Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Share thoughtful analysis and insights</li>
            <li>• Be respectful of different opinions</li>
            <li>• No financial advice or guaranteed returns</li>
            <li>• Cite sources when sharing specific information</li>
            <li>• Report inappropriate content to moderators</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
