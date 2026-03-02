'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import NotificationCenter from '@/components/notifications/NotificationCenter';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto relative">
        {/* Notification Bell */}
        <div className="absolute top-4 right-4 z-10">
          <NotificationCenter />
        </div>
        {children}
      </main>
    </div>
  );
}
