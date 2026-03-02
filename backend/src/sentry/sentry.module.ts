import { Module, OnModuleInit } from '@nestjs/common';

// Mock Sentry module for development
// In production, replace with actual Sentry imports

const MockSentryModule = {
  init: (config: any) => ({
    module: class MockModule {},
    providers: [],
    exports: [],
  }),
};

const MockSentry = {
  init: () => {},
  captureException: () => {},
  captureMessage: () => {},
  addBreadcrumb: () => {},
  setUser: () => {},
  setTag: () => {},
  setContext: () => {},
  withScope: (callback: any) => callback({}),
};

@Module({
  imports: [
    MockSentryModule.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.SENTRY_RELEASE || process.env.npm_package_version,
      
      // Performance monitoring
      tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE 
        ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) 
        : 0.1,
      
      // Session replay
      replaysSessionSampleRate: process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE
        ? parseFloat(process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE)
        : 0.1,
      replaysOnErrorSampleRate: process.env.SENTRY_REPLAYS_ERROR_SAMPLE_RATE
        ? parseFloat(process.env.SENTRY_REPLAYS_ERROR_SAMPLE_RATE)
        : 1.0,
      
      // Profiling
      profilesSampleRate: process.env.SENTRY_PROFILES_SAMPLE_RATE
        ? parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE)
        : 1.0,
      
      // Integrations (mocked for development)
      integrations: [],
      
      // Before send hook for filtering
      beforeSend: (event: any, hint: any) => {
        // Filter out certain errors
        if (event.exception) {
          const error = hint.originalException as Error;
          
          // Filter out health check errors in production
          if (process.env.NODE_ENV === 'production' && 
              error.message?.includes('health check')) {
            return null;
          }
          
          // Filter out 404 errors
          if (event.request?.url?.includes('/health') || 
              event.request?.url?.includes('/metrics')) {
            return null;
          }
        }
        
        // Add custom context
        event.tags = {
          ...event.tags,
          service: 'nse-backend',
          version: process.env.npm_package_version || 'unknown',
        };
        
        event.contexts = {
          ...event.contexts,
          app: {
            name: 'NSE Intelligence Backend',
            version: process.env.npm_package_version || 'unknown',
            environment: process.env.NODE_ENV || 'development',
          },
        };
        
        return event;
      },
      
      // Error classification
      classifyErrors: true,
      
      // Debug mode (only in development)
      debug: process.env.NODE_ENV === 'development',
    }),
  ],
  providers: [],
  exports: [],
})
export class SentryConfigModule implements OnModuleInit {
  onModuleInit() {
    // Set up global error handlers
    process.on('uncaughtException', (error) => {
      MockSentry.captureException(error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      MockSentry.captureException(reason);
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
    
    // Set user context if available
    if (process.env.SENTRY_USER_ID) {
      MockSentry.setUser({
        id: process.env.SENTRY_USER_ID,
        email: process.env.SENTRY_USER_EMAIL,
      });
    }
    
    // Set custom tags
    MockSentry.setTag('service', 'nse-backend');
    MockSentry.setTag('environment', process.env.NODE_ENV || 'development');
    
    console.log('Sentry initialized for backend service (mock mode)');
  }
}
