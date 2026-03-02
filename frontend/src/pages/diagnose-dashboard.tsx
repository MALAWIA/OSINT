import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function DiagnoseDashboard() {
  const [diagnosis, setDiagnosis] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);
  const router = useRouter();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    const runDiagnosis = async () => {
      addLog('Starting comprehensive dashboard access diagnosis...');
      
      const results = {
        // 1. Environment Check
        environment: {
          hasWindow: typeof window !== 'undefined',
          hasLocalStorage: typeof localStorage !== 'undefined',
          hasSessionStorage: typeof sessionStorage !== 'undefined',
          currentPath: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'
        },
        
        // 2. Authentication Systems Check
        authentication: {
          // Check all auth managers
          authManager: null,
          authManagerClean: null,
          jwtAuthManager: null,
          
          // Check localStorage contents
          localStorage: {
            access_token: localStorage.getItem('access_token'),
            current_user: localStorage.getItem('current_user'),
            jwt_token: localStorage.getItem('jwt_token'),
            jwt_user: localStorage.getItem('jwt_user'),
            jwt_expiry: localStorage.getItem('jwt_expiry'),
            allKeys: Object.keys(localStorage)
          }
        },
        
        // 3. Page Accessibility Check
        pages: {
          dashboard: null,
          dashboardClean: null,
          dashboardJWT: null,
          login: null,
          loginClean: null,
          loginJWT: null,
          stocks: null
        },
        
        // 4. Network Check
        network: {
          online: typeof navigator !== 'undefined' ? navigator.onLine : false,
          apiReachable: null
        }
      };

      // Try to import and test each auth manager
      try {
        const authModule = await import('@/lib/auth');
        results.authentication.authManager = {
          available: true,
          instance: authModule.authManager,
          isAuthenticated: authModule.authManager.isAuthenticated(),
          token: authModule.authManager.getToken(),
          user: authModule.authManager.getCurrentUser()
        };
        addLog(`Original AuthManager: ${results.authentication.authManager.isAuthenticated ? '✅ Available' : '❌ Failed'}`);
      } catch (error) {
        addLog(`Original AuthManager: ❌ Import failed - ${error.message}`);
      }

      try {
        const authCleanModule = await import('@/lib/auth-clean');
        results.authentication.authManagerClean = {
          available: true,
          instance: authCleanModule.authManagerClean,
          isAuthenticated: authCleanModule.authManagerClean.isAuthenticated(),
          token: authCleanModule.authManagerClean.getToken(),
          user: authCleanModule.authManagerClean.getCurrentUser()
        };
        addLog(`Clean AuthManager: ${results.authentication.authManagerClean.isAuthenticated ? '✅ Available' : '❌ Failed'}`);
      } catch (error) {
        addLog(`Clean AuthManager: ❌ Import failed - ${error.message}`);
      }

      try {
        const jwtAuthModule = await import('@/lib/jwt-auth');
        results.authentication.jwtAuthManager = {
          available: true,
          instance: jwtAuthModule.jwtAuthManager,
          isAuthenticated: jwtAuthModule.jwtAuthManager.isAuthenticated(),
          token: jwtAuthModule.jwtAuthManager.getToken(),
          user: jwtAuthModule.jwtAuthManager.getUser(),
          tokenExpiry: jwtAuthModule.jwtAuthManager.getTokenExpiry(),
          isExpiringSoon: jwtAuthModule.jwtAuthManager.isTokenExpiringSoon()
        };
        addLog(`JWT AuthManager: ${results.authentication.jwtAuthManager.isAuthenticated ? '✅ Available' : '❌ Failed'}`);
      } catch (error) {
        addLog(`JWT AuthManager: ❌ Import failed - ${error.message}`);
      }

      // Test page accessibility
      const pageTests = [
        { name: 'dashboard', url: '/dashboard' },
        { name: 'dashboard-clean', url: '/dashboard-clean' },
        { name: 'dashboard-jwt', url: '/dashboard-jwt' },
        { name: 'login', url: '/login' },
        { name: 'login-clean', url: '/login-clean' },
        { name: 'login-jwt', url: '/login-jwt' },
        { name: 'stocks', url: '/stocks' }
      ];

      for (const page of pageTests) {
        try {
          const response = await fetch(page.url, { method: 'HEAD' });
          results.pages[page.name] = {
            accessible: response.ok,
            status: response.status,
            url: page.url
          };
          addLog(`${page.name} page: ${response.ok ? '✅ Accessible' : '❌ Not accessible'} (${response.status})`);
        } catch (error) {
          results.pages[page.name] = {
            accessible: false,
            error: error.message,
            url: page.url
          };
          addLog(`${page.name} page: ❌ Error - ${error.message}`);
        }
      }

      // Test API connectivity
      try {
        const apiResponse = await fetch('http://localhost:3001/api/health', {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        results.network.apiReachable = apiResponse.ok;
        addLog(`API Health Check: ${apiResponse.ok ? '✅ Reachable' : '❌ Not reachable'} (${apiResponse.status})`);
      } catch (error) {
        results.network.apiReachable = false;
        addLog(`API Health Check: ❌ Failed - ${error.message}`);
      }

      setDiagnosis(results);
      addLog('Diagnosis complete!');
    };

    runDiagnosis();
  }, []);

  const testPage = (pageUrl: string) => {
    addLog(`Testing navigation to: ${pageUrl}`);
    router.push(pageUrl);
  };

  const clearAllAuth = () => {
    addLog('Clearing all authentication data...');
    
    // Clear all localStorage
    if (typeof localStorage !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => localStorage.removeItem(key));
      addLog(`Cleared ${keys.length} localStorage items`);
    }
    
    // Clear all session storage
    if (typeof sessionStorage !== 'undefined') {
      const sessionKeys = Object.keys(sessionStorage);
      sessionKeys.forEach(key => sessionStorage.removeItem(key));
      addLog(`Cleared ${sessionKeys.length} sessionStorage items`);
    }
    
    addLog('All authentication data cleared');
  };

  const initializeAuth = async (authType: string) => {
    try {
      addLog(`Initializing ${authType} authentication...`);
      
      switch (authType) {
        case 'original':
          await initializeAuth(authType);
          await testPage('/login-clean');
          break;
        case 'clean':
          await initializeAuth(authType);
          await testPage('/login-clean');
          break;
        case 'jwt':
          await initializeAuth(authType);
          await testPage('/login-jwt');
          break;
      }
    } catch (error) {
      addLog(`Failed to initialize ${authType} auth: ${error.message}`);
    }
  };

  const testLogin = async (authType: string) => {
    try {
      addLog(`Testing ${authType} login...`);
      
      switch (authType) {
        case 'original':
        case 'clean':
          await initializeAuth(authType);
          await testPage('/login-clean');
          break;
        case 'jwt':
          await initializeAuth(authType);
          await testPage('/login-jwt');
          break;
      }
    } catch (error) {
      addLog(`Failed to test ${authType} login: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">🔍 Dashboard Access Diagnosis</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Environment Status */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">🌐 Environment</h2>
            <div className="text-sm space-y-1">
              <div>Window: {diagnosis.environment?.hasWindow ? '✅' : '❌'}</div>
              <div>LocalStorage: {diagnosis.environment?.hasLocalStorage ? '✅' : '❌'}</div>
              <div>Current Path: {diagnosis.environment?.currentPath}</div>
              <div>User Agent: {diagnosis.environment?.userAgent?.substring(0, 50)}...</div>
            </div>
          </div>

          {/* Authentication Status */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">🔐 Authentication Systems</h2>
            <div className="text-sm space-y-2">
              <div className="border-b pb-2">
                <div className="font-medium">Original Auth:</div>
                <div>Available: {diagnosis.authentication?.authManager?.available ? '✅' : '❌'}</div>
                <div>Authenticated: {diagnosis.authentication?.authManager?.isAuthenticated ? '✅' : '❌'}</div>
                <div>Token: {diagnosis.authentication?.authManager?.token ? '✅' : '❌'}</div>
              </div>
              
              <div className="border-b pb-2">
                <div className="font-medium">Clean Auth:</div>
                <div>Available: {diagnosis.authentication?.authManagerClean?.available ? '✅' : '❌'}</div>
                <div>Authenticated: {diagnosis.authentication?.authManagerClean?.isAuthenticated ? '✅' : '❌'}</div>
                <div>Token: {diagnosis.authentication?.authManagerClean?.token ? '✅' : '❌'}</div>
              </div>
              
              <div className="border-b pb-2">
                <div className="font-medium">JWT Auth:</div>
                <div>Available: {diagnosis.authentication?.jwtAuthManager?.available ? '✅' : '❌'}</div>
                <div>Authenticated: {diagnosis.authentication?.jwtAuthManager?.isAuthenticated ? '✅' : '❌'}</div>
                <div>Token: {diagnosis.authentication?.jwtAuthManager?.token ? '✅' : '❌'}</div>
                <div>Expiry: {diagnosis.authentication?.jwtAuthManager?.tokenExpiry ? new Date(diagnosis.authentication.jwtAuthManager.tokenExpiry * 1000).toLocaleString() : 'None'}</div>
              </div>
            </div>
          </div>

          {/* Page Accessibility */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">📄 Page Accessibility</h2>
            <div className="text-sm space-y-1">
              {Object.entries(diagnosis.pages || {}).map(([name, page]: [string, any]) => (
                <div key={name} className="flex justify-between">
                  <span>{name}:</span>
                  <span className={page?.accessible ? 'text-green-600' : 'text-red-600'}>
                    {page?.accessible ? '✅' : '❌'} ({page?.status || 'Unknown'})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Network Status */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">🌐 Network</h2>
            <div className="text-sm space-y-1">
              <div>Online: {diagnosis.network?.online ? '✅' : '❌'}</div>
              <div>API Reachable: {diagnosis.network?.apiReachable ? '✅' : '❌'}</div>
            </div>
          </div>

          {/* LocalStorage Contents */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-3">💾 LocalStorage</h2>
            <div className="text-sm space-y-1">
              <div>Keys: {diagnosis.authentication?.localStorage?.allKeys?.join(', ') || 'None'}</div>
              <div>access_token: {diagnosis.authentication?.localStorage?.access_token ? '✅' : '❌'}</div>
              <div>current_user: {diagnosis.authentication?.localStorage?.current_user ? '✅' : '❌'}</div>
              <div>jwt_token: {diagnosis.authentication?.localStorage?.jwt_token ? '✅' : '❌'}</div>
              <div>jwt_user: {diagnosis.authentication?.localStorage?.jwt_user ? '✅' : '❌'}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">🛠️ Test Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            <button
              onClick={() => testPage('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm"
            >
              📊 Original Dashboard
            </button>
            
            <button
              onClick={() => testPage('/dashboard-clean')}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-sm"
            >
              📊 Clean Dashboard
            </button>
            
            <button
              onClick={() => testPage('/dashboard-jwt')}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-sm"
            >
              📊 JWT Dashboard
            </button>
            
            <button
              onClick={() => testLogin('original')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded text-sm"
            >
              🔑 Original Login
            </button>
            
            <button
              onClick={() => testLogin('clean')}
              className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded text-sm"
            >
              🔑 Clean Login
            </button>
            
            <button
              onClick={() => testLogin('jwt')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded text-sm"
            >
              🔑 JWT Login
            </button>
            
            <button
              onClick={clearAllAuth}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm"
            >
              🗑️ Clear All Auth
            </button>
          </div>
        </div>

        {/* Diagnostic Logs */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">📋 Diagnostic Logs</h2>
            <button
              onClick={() => setLogs([])}
              className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
            >
              Clear Logs
            </button>
          </div>
          
          <div className="bg-black text-green-400 p-4 rounded font-mono text-xs h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p>No diagnostic logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>• Use this page to diagnose dashboard access issues</p>
          <p>• Test all authentication systems and dashboard variants</p>
          <p>• Check browser console for detailed logs</p>
          <p>• Current path: {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}
