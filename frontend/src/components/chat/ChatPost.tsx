'use client';

import { useState } from 'react';

interface Reply {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface ChatPostProps {
  id: string;
  author: string;
  avatar: string;
  timestamp: string;
  content: string;
  likes: number;
  replies: Reply[];
  isLiked: boolean;
  onLike: (postId: string) => void;
  onReply: (postId: string, content: string) => void;
}

export default function ChatPost({
  id,
  author,
  avatar,
  timestamp,
  content,
  likes,
  replies,
  isLiked,
  onLike,
  onReply
}: ChatPostProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(true);

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(id, replyContent);
      setReplyContent('');
      setShowReplyInput(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {author.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <div className="font-medium text-gray-900">{author}</div>
            <div className="text-sm text-gray-500">{formatTimeAgo(timestamp)}</div>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {new Date(timestamp).toLocaleDateString()}
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
      </div>

      {/* Post Actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onLike(id)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
              isLiked 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm font-medium">{likes}</span>
          </button>
          
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium">{replies.length}</span>
          </button>
        </div>
        
        {replies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showReplies ? 'Hide' : 'Show'} Replies ({replies.length})
          </button>
        )}
      </div>

      {/* Reply Input */}
      {showReplyInput && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Share your thoughts on this post..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setShowReplyInput(false);
                setReplyContent('');
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleReply}
              disabled={!replyContent.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reply
            </button>
          </div>
        </div>
      )}

      {/* Replies Section */}
      {showReplies && replies.length > 0 && (
        <div className="border-t pt-4">
          <div className="space-y-3">
            {replies.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {reply.author.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">{reply.author}</span>
                    <span className="text-xs text-gray-500">{formatTimeAgo(reply.timestamp)}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{reply.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      className={`flex items-center gap-1 text-xs ${
                        reply.isLiked 
                          ? 'text-red-600' 
                          : 'text-gray-500 hover:text-red-600'
                      }`}
                    >
                      <svg className="w-3 h-3" fill={reply.isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {reply.likes}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
