#!/bin/bash

# Health Check Script for NSE Intelligence Platform
# Checks all services and reports status

set -e

echo "🔍 NSE Intelligence Platform Health Check"
echo "========================================"

# Check if Docker Compose is running
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "❌ Docker Compose services are not running"
    exit 1
fi

# Check individual services
services=("postgres" "redis" "elasticsearch" "backend" "frontend" "nginx")

for service in "${services[@]}"; do
    if docker-compose -f docker-compose.prod.yml ps | grep -q "$service.*Up"; then
        echo "✅ $service: Running"
    else
        echo "❌ $service: Not running"
    fi
done

# Check health endpoints
echo ""
echo "🌐 Checking HTTP endpoints..."

# Check frontend
if curl -f -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: Responding"
else
    echo "❌ Frontend: Not responding"
fi

# Check backend API
if curl -f -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend API: Healthy"
else
    echo "❌ Backend API: Not healthy"
fi

# Check database connection
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U nse_user -d nse_intelligence_prod > /dev/null; then
    echo "✅ Database: Connected"
else
    echo "❌ Database: Not connected"
fi

# Check Redis
if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping > /dev/null; then
    echo "✅ Redis: Connected"
else
    echo "❌ Redis: Not connected"
fi

# Check Elasticsearch
if curl -f -s http://localhost:9200/_cluster/health | grep -q '"status":"green"'; then
    echo "✅ Elasticsearch: Healthy"
else
    echo "❌ Elasticsearch: Not healthy"
fi

# Check SSL certificates
echo ""
echo "🔐 Checking SSL certificates..."

if [ -f "nginx/ssl/cert.pem" ]; then
    expiry=$(openssl x509 -in nginx/ssl/cert.pem -noout -enddate | cut -d= -f2)
    echo "✅ SSL Certificate: Valid until $expiry"
else
    echo "❌ SSL Certificate: Not found"
fi

# Check disk space
echo ""
echo "💾 Checking disk space..."
df -h | grep -E "/$|/var" | while read line; do
    usage=$(echo $line | awk '{print $5}' | sed 's/%//')
    if [ $usage -gt 80 ]; then
        echo "⚠️  Disk usage high: $line"
    else
        echo "✅ Disk usage OK: $line"
    fi
done

echo ""
echo "📊 Monitoring services status..."
if docker-compose -f docker-compose.prod.yml --profile monitoring ps | grep -q "prometheus.*Up"; then
    echo "✅ Prometheus: Running"
else
    echo "ℹ️  Prometheus: Not running (use --profile monitoring)"
fi

if docker-compose -f docker-compose.prod.yml --profile monitoring ps | grep -q "grafana.*Up"; then
    echo "✅ Grafana: Running"
else
    echo "ℹ️  Grafana: Not running (use --profile monitoring)"
fi

echo ""
echo "🎉 Health check completed!"
