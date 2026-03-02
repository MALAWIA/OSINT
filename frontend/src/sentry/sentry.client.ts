import * as Sentry from '@sentry/nextjs';
import { BrowserTracing } from '@sentry/tracing';
import { Replay } from '@sentry/replay';

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',
      release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || process.env.npm_package_version,
      
      // Performance monitoring
      integrations: [
        new BrowserTracing({
          routingInstrumentation: Sentry.reactRouterV6Instrumentation(
            React.useEffect,
            React.useLocation,
            React.useNavigationType,
            React.createRoutesFromChildren,
            React.matchRoutes,
          ),
        }),
        new Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance settings
      tracesSampleRate: process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE
        ? parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE)
        : 0.1,
      
      // Session replay settings
      replaysSessionSampleRate: process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE
        ? parseFloat(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE)
        : 0.1,
      replaysOnErrorSampleRate: process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ERROR_SAMPLE_RATE
        ? parseFloat(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ERROR_SAMPLE_RATE)
        : 1.0,
      
      // Before send hook for filtering
      beforeSend(event, hint) {
        // Filter out certain errors
        if (event.exception) {
          const error = hint.originalException as Error;
          
          // Filter out errors from development
          if (process.env.NODE_ENV === 'development') {
            return null;
          }
          
          // Filter out network errors that are expected
          if (error.message?.includes('Network Error') || 
              error.message?.includes('fetch')) {
            return null;
          }
        }
        
        // Add custom context
        event.tags = {
          ...event.tags,
          service: 'nse-frontend',
          version: process.env.npm_package_version || 'unknown',
        };
        
        event.contexts = {
          ...event.contexts,
          app: {
            name: 'NSE Intelligence Frontend',
            version: process.env.npm_package_version || 'unknown',
            environment: process.env.NODE_ENV || 'development',
          },
          browser: {
            name: navigator.userAgent,
            version: navigator.appVersion,
          },
        };
        
        return event;
      },
      
      // Debug mode (only in development)
      debug: process.env.NODE_ENV === 'development',
      
      // Error classification
      normalizeDepth: 10,
      
      // Deny URLs for performance monitoring
      denyUrls: [
        // Chrome extensions
        /extensions\//i,
        /^chrome:\/\//i,
        // Local files
        /^file:\/\//i,
      ],
    });
    
    // Set user context if available
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      if (userId) {
        Sentry.setUser({
          id: userId,
        });
      }
    }
    
    console.log('Sentry initialized for frontend');
  }
}

export function captureException(error: Error, context?: any) {
  Sentry.withScope((scope) => {
    if (context) {
      scope.setContext('custom_context', context);
    }
    Sentry.captureException(error);
  });
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}

export function setUser(user: Sentry.User) {
  Sentry.setUser(user);
}

export function clearUser() {
  Sentry.setUser(null);
}
