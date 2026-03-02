#!/bin/bash

# Production Build Script for NSE Intelligence Platform
# Builds and tests all production Docker images

set -e

echo "🏗️ Building production Docker images..."

# Load production environment
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
else
    echo "❌ .env.production file not found"
    exit 1
fi

# Build backend
echo "📦 Building backend production image..."
docker build -f backend/Dockerfile.prod -t nse-backend:latest ./backend

# Build frontend
echo "📦 Building frontend production image..."
docker build -f frontend/Dockerfile.prod -t nse-frontend:latest ./frontend

# Build OSINT processor
echo "📦 Building OSINT processor production image..."
docker build -f osint-processor/Dockerfile.prod -t nse-osint:latest ./osint-processor

# Security scan images
echo "🔍 Scanning images for vulnerabilities..."
if command -v docker scan &> /dev/null; then
    docker scan nse-backend:latest
    docker scan nse-frontend:latest
    docker scan nse-osint:latest
else
    echo "⚠️ Docker scan not available. Install for security scanning."
fi

# Test images
echo "🧪 Testing production images..."

# Test backend
echo "Testing backend image..."
docker run --rm -d --name test-backend \
    -e NODE_ENV=production \
    -e DATABASE_URL=postgresql://test:test@localhost:5432/test \
    nse-backend:latest

sleep 10
if docker exec test-backend curl -f http://localhost:3001/health; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
fi
docker stop test-backend

# Test frontend
echo "Testing frontend image..."
docker run --rm -d --name test-frontend \
    -e NODE_ENV=production \
    nse-frontend:latest

sleep 10
if docker exec test-frontend curl -f http://localhost:3000; then
    echo "✅ Frontend health check passed"
else
    echo "❌ Frontend health check failed"
fi
docker stop test-frontend

# Test OSINT processor
echo "Testing OSINT processor image..."
docker run --rm -d --name test-osint \
    -e PYTHONPATH=/app \
    -e DATABASE_URL=postgresql://test:test@localhost:5432/test \
    nse-osint:latest

sleep 15
if docker exec test-osint python -c "import requests; print('OSINT processor ready')"; then
    echo "✅ OSINT processor test passed"
else
    echo "❌ OSINT processor test failed"
fi
docker stop test-osint

# Create image tags
echo "🏷️ Tagging images..."
VERSION=$(date +%Y%m%d_%H%M%S)
docker tag nse-backend:latest nse-backend:$VERSION
docker tag nse-frontend:latest nse-frontend:$VERSION
docker tag nse-osint:latest nse-osint:$VERSION

echo "✅ Production build completed!"
echo "📋 Images built:"
echo "  - nse-backend:latest ($VERSION)"
echo "  - nse-frontend:latest ($VERSION)"
echo "  - nse-osint:latest ($VERSION)"

# Create build manifest
cat > build-manifest-$VERSION.json << EOF
{
  "build_date": "$(date)",
  "version": "$VERSION",
  "images": {
    "backend": "nse-backend:$VERSION",
    "frontend": "nse-frontend:$VERSION",
    "osint": "nse-osint:$VERSION"
  },
  "environment": "production",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "docker_version": "$(docker --version)"
}
EOF

echo "📋 Build manifest: build-manifest-$VERSION.json"
