'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'stocks',
    label: 'Stocks',
    icon: '📈',
    path: '/stocks'
  },
  {
    id: 'news',
    label: 'News',
    icon: '📰',
    path: '/news'
  },
  {
    id: 'sentiment',
    label: 'Sentiment Analysis',
    icon: '📊',
    path: '/sentiment'
  },
  {
    id: 'chat',
    label: 'Discussions',
    icon: '💬',
    path: '/chat'
  },
  {
    id: 'groups',
    label: 'Groups',
    icon: '👥',
    path: '/groups'
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: '🔔',
    path: '/notifications'
  }
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen transition-all duration-300 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">NSE Platform</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">Intelligence Dashboard</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600 dark:border-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>© 2024 NSE Intelligence</p>
            <p>Powered by OSINT</p>
          </div>
        )}
        {isCollapsed && (
          <div className="text-center">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}
