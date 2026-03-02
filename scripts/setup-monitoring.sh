#!/bin/bash

# Monitoring Setup Script for NSE Intelligence Platform
# Sets up comprehensive monitoring with Prometheus, Grafana, and log aggregation

set -e

echo "📊 Setting up monitoring infrastructure..."

# Create monitoring directories
mkdir -p monitoring/grafana/dashboards
mkdir -p monitoring/grafana/datasources
mkdir -p monitoring/alerts
mkdir -p logs

# Create log rotation configuration
cat > /etc/logrotate.d/nse-intelligence << 'EOF'
/var/log/nse-intelligence/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker-compose -f /opt/nse-intelligence/docker-compose.prod.yml restart nginx
    endscript
}
EOF

# Create application logging configuration
cat > monitoring/logging.yml << 'EOF'
version: 1
disable_existing_loggers: false

formatters:
  default:
    format: '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
  detailed:
    format: '%(asctime)s - %(name)s - %(levelname)s - %(module)s - %(funcName)s - %(message)s'

handlers:
  console:
    class: logging.StreamHandler
    level: INFO
    formatter: default
    stream: ext://sys.stdout

  file:
    class: logging.handlers.RotatingFileHandler
    level: INFO
    formatter: detailed
    filename: /var/log/nse-intelligence/app.log
    maxBytes: 10485760  # 10MB
    backupCount: 5

  error_file:
    class: logging.handlers.RotatingFileHandler
    level: ERROR
    formatter: detailed
    filename: /var/log/nse-intelligence/error.log
    maxBytes: 10485760  # 10MB
    backupCount: 5

loggers:
  nse_intelligence:
    level: INFO
    handlers: [console, file, error_file]
    propagate: false

  nse_intelligence.security:
    level: WARNING
    handlers: [console, file, error_file]
    propagate: false

  nse_intelligence.performance:
    level: INFO
    handlers: [console, file]
    propagate: false

root:
  level: INFO
  handlers: [console, file]
EOF

# Create alert rules
cat > monitoring/alerts/rules.yml << 'EOF'
groups:
  - name: nse_intelligence_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"

      - alert: DatabaseConnectionFailure
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failure"
          description: "PostgreSQL database is down"

      - alert: RedisConnectionFailure
        expr: up{job="redis"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis connection failure"
          description: "Redis cache is down"

      - alert: ElasticsearchDown
        expr: up{job="elasticsearch"} == 0
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Elasticsearch is down"
          description: "Search service is unavailable"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 90
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is {{ $value }}%"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space"
          description: "Disk space is {{ $value }}% available"

      - alert: ContainerDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Container is down"
          description: "Container {{ $labels.instance }} has been down for more than 1 minute"
EOF

# Create health check script
cat > scripts/health-check.sh << 'EOF'
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
EOF

# Make scripts executable
chmod +x scripts/health-check.sh

echo "✅ Monitoring infrastructure setup complete!"
echo "📊 Grafana will be available at http://localhost:3001 (admin/admin)"
echo "📈 Prometheus will be available at http://localhost:9090"
echo "🔍 Run health checks with: ./scripts/health-check.sh"
