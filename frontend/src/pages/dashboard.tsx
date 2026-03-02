import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authManager } from '@/lib/auth';
import Dashboard from '@/components/dashboard/Dashboard';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Initialize auth state and redirect if not authenticated
    authManager.initialize();
    
    if (!authManager.isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  if (!authManager.isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
