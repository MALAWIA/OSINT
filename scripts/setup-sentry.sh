#!/bin/bash

# Sentry Setup Script for NSE Intelligence Platform
# Configures error tracking and performance monitoring

set -e

echo "🔧 Setting up Sentry error tracking..."

# Check if Sentry DSN is provided
if [ -z "$SENTRY_DSN" ]; then
    echo "❌ SENTRY_DSN environment variable is required"
    echo "💡 Get your DSN from https://sentry.io/"
    exit 1
fi

# Add Sentry dependencies to backend
echo "📦 Adding Sentry dependencies to backend..."
cd backend

if ! grep -q "@sentry/node" package.json; then
    npm install --save @sentry/node @sentry/tracing @sentry/profiling-node
fi

if ! grep -q "@sentry/nestjs" package.json; then
    npm install --save @sentry/nestjs
fi

cd ..

# Add Sentry dependencies to frontend
echo "📦 Adding Sentry dependencies to frontend..."
cd frontend

if ! grep -q "@sentry/nextjs" package.json; then
    npm install --save @sentry/nextjs @sentry/tracing @sentry/replay
fi

cd ..

# Add Sentry dependencies to OSINT processor
echo "📦 Adding Sentry dependencies to OSINT processor..."
cd osint-processor

if ! grep -q "sentry-sdk" requirements.txt; then
    echo "sentry-sdk[fastapi]==1.40.0" >> requirements.txt
fi

if ! grep -q "sentry-sdk" requirements.txt; then
    echo "sentry-sdk[sqlalchemy]==1.40.0" >> requirements.txt
fi

cd ..

# Update environment files
echo "📝 Updating environment files..."

# Update backend environment
if [ -f ".env.production" ]; then
    if ! grep -q "SENTRY_DSN" .env.production; then
        echo "" >> .env.production
        echo "# Sentry Configuration" >> .env.production
        echo "SENTRY_DSN=$SENTRY_DSN" >> .env.production
        echo "SENTRY_ENVIRONMENT=production" >> .env.production
        echo "SENTRY_RELEASE=\${npm_package_version}" >> .env.production
        echo "SENTRY_TRACES_SAMPLE_RATE=0.1" >> .env.production
        echo "SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1" >> .env.production
        echo "SENTRY_REPLAYS_ERROR_SAMPLE_RATE=1.0" >> .env.production
        echo "SENTRY_PROFILES_SAMPLE_RATE=1.0" >> .env.production
        echo "SENTRY_LOG_LEVEL=ERROR" >> .env.production
        echo "SENTRY_EVENT_LEVEL=ERROR" >> .env.production
        echo "SENTRY_MAX_BREADCRUMBS=100" >> .env.production
    fi
fi

# Update frontend environment
if [ -f ".env.production" ]; then
    if ! grep -q "NEXT_PUBLIC_SENTRY_DSN" .env.production; then
        echo "" >> .env.production
        echo "# Frontend Sentry Configuration" >> .env.production
        echo "NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN" >> .env.production
        echo "NEXT_PUBLIC_SENTRY_ENVIRONMENT=production" >> .env.production
        echo "NEXT_PUBLIC_SENTRY_RELEASE=\${npm_package_version}" >> .env.production
        echo "NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1" >> .env.production
        echo "NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1" >> .env.production
        echo "NEXT_PUBLIC_SENTRY_REPLAYS_ERROR_SAMPLE_RATE=1.0" >> .env.production
    fi
fi

# Create Sentry configuration files
echo "📄 Creating Sentry configuration files..."

# Create backend sentry configuration
mkdir -p backend/src/sentry
cat > backend/src/sentry/sentry.service.ts << 'EOF'
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryService implements OnModuleInit {
  onModuleInit() {
    Sentry.configureScope((scope) => {
      scope.setTag('service', 'nse-backend');
      scope.setTag('environment', process.env.NODE_ENV || 'development');
    });
  }

  captureException(error: Error, context?: any) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('custom_context', context);
      }
      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
    Sentry.captureMessage(message, level);
  }

  setUser(user: Sentry.User) {
    Sentry.setUser(user);
  }

  clearUser() {
    Sentry.setUser(null);
  }

  addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
    Sentry.addBreadcrumb(breadcrumb);
  }

  setTag(key: string, value: string) {
    Sentry.setTag(key, value);
  }

  setContext(key: string, value: any) {
    Sentry.setContext(key, value);
  }
}
EOF

# Create frontend sentry hooks
mkdir -p frontend/src/hooks
cat > frontend/src/hooks/useSentry.ts << 'EOF'
import { useCallback } from 'react';
import * as Sentry from '@sentry/nextjs';

export function useSentry() {
  const captureException = useCallback((error: Error, context?: any) => {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('custom_context', context);
      }
      Sentry.captureException(error);
    });
  }, []);

  const captureMessage = useCallback((message: string, level: Sentry.SeverityLevel = 'info') => {
    Sentry.captureMessage(message, level);
  }, []);

  const addBreadcrumb = useCallback((breadcrumb: Sentry.Breadcrumb) => {
    Sentry.addBreadcrumb(breadcrumb);
  }, []);

  const setUser = useCallback((user: Sentry.User) => {
    Sentry.setUser(user);
  }, []);

  const clearUser = useCallback(() => {
    Sentry.setUser(null);
  }, []);

  return {
    captureException,
    captureMessage,
    addBreadcrumb,
    setUser,
    clearUser,
  };
}
EOF

# Create error boundary component
mkdir -p frontend/src/components
cat > frontend/src/components/ErrorBoundary.tsx << 'EOF'
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. The error has been reported to our team.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
EOF

# Create deployment script with Sentry
cat > scripts/deploy-with-sentry.sh << 'EOF'
#!/bin/bash

# Deployment script with Sentry release tracking

set -e

ENVIRONMENT=${1:-"production"}
VERSION=${2:-$(date +%Y%m%d_%H%M%S)}

echo "🚀 Deploying with Sentry tracking..."

# Create Sentry release
if command -v sentry-cli &> /dev/null; then
    echo "📊 Creating Sentry release..."
    sentry-cli releases new -p nse-intelligence-backend -p nse-intelligence-frontend -p nse-intelligence-osint "$VERSION"
    
    # Associate commits with release
    sentry-cli releases set-commits --auto "$VERSION"
    
    # Deploy notification
    sentry-cli releases deploys "$VERSION" new -e "$ENVIRONMENT"
fi

# Run deployment
./scripts/deploy.sh "$ENVIRONMENT" "$VERSION"

# Finalize Sentry release
if command -v sentry-cli &> /dev/null; then
    echo "✅ Finalizing Sentry release..."
    sentry-cli releases deploys "$VERSION" finalize -e "$ENVIRONMENT"
    sentry-cli releases finalize "$VERSION"
fi

echo "🎉 Deployment with Sentry tracking completed!"
EOF

chmod +x scripts/deploy-with-sentry.sh

# Create Sentry monitoring script
cat > scripts/sentry-monitor.sh << 'EOF'
#!/bin/bash

# Sentry monitoring script for deployment health

set -e

SENTRY_ORG=${SENTRY_ORG:-"your-org"}
SENTRY_PROJECT=${SENTRY_PROJECT:-"nse-intelligence"}

echo "📊 Checking Sentry for recent issues..."

if command -v sentry-cli &> /dev/null; then
    # Get recent issues
    echo "🔍 Recent issues (last 24 hours):"
    sentry-cli issues list --period 24h --org "$SENTRY_ORG" --project "$SENTRY_PROJECT"
    
    # Get error rate
    echo "📈 Error rate trends:"
    sentry-cli projects stats --org "$SENTRY_ORG" --project "$SENTRY_PROJECT" --period 24h
    
    # Get release health
    if [ -n "$1" ]; then
        echo "🏥 Release health for $1:"
        sentry-cli releases health "$1" --org "$SENTRY_ORG" --project "$SENTRY_PROJECT"
    fi
else
    echo "❌ sentry-cli not found. Install with: npm install -g @sentry/cli"
fi
EOF

chmod +x scripts/sentry-monitor.sh

echo "✅ Sentry setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Install dependencies: npm install (in each directory)"
echo "2. Update your Sentry DSN in environment files"
echo "3. Import Sentry modules in your application files"
echo "4. Test error tracking by triggering a test error"
echo ""
echo "🔧 Useful commands:"
echo "  ./scripts/deploy-with-sentry.sh production"
echo "  ./scripts/sentry-monitor.sh"
echo ""
echo "📊 Visit your Sentry dashboard to monitor errors and performance"
