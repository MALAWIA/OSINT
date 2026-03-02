'use client';

import { useState } from 'react';

interface CreatePostProps {
  onCreatePost: (content: string) => void;
}

export default function CreatePost({ onCreatePost }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      onCreatePost(content);
      setContent('');
      setCharCount(0);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= maxChars) {
      setContent(newContent);
      setCharCount(newContent.length);
    }
  };

  const suggestedTopics = [
    'SCOM earnings outlook',
    'Banking sector trends',
    'Market volatility',
    'EABL dividend prospects',
    'KPLC renewable energy',
    'Tech stocks performance'
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
          Y
        </div>
        <div className="ml-3">
          <div className="font-medium text-gray-900">You</div>
          <div className="text-sm text-gray-500">Share your market analysis</div>
        </div>
      </div>

      <div className="mb-3">
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="What's your take on the current market trends? Share your analysis, predictions, or insights..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-gray-500">
            {charCount}/{maxChars} characters
          </div>
          {charCount > maxChars * 0.9 && (
            <div className="text-sm text-orange-600">
              Almost at character limit
            </div>
          )}
        </div>
      </div>

      {/* Suggested Topics */}
      {!content && (
        <div className="mb-3">
          <div className="text-sm text-gray-600 mb-2">Suggested topics:</div>
          <div className="flex flex-wrap gap-2">
            {suggestedTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => setContent(`Thoughts on ${topic}...`)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Be respectful and constructive</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Posting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Post
            </>
          )}
        </button>
      </div>

      {/* Disclaimer */}
      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="text-xs text-yellow-800">
            <strong>Disclaimer:</strong> This is not financial advice. All posts are personal opinions and should not be considered as investment recommendations.
          </div>
        </div>
      </div>
    </div>
  );
}
