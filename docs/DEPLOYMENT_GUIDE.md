# NSE Intelligence Platform Deployment Guide

## Overview

Production deployment guide for the NSE Intelligence & Communication Platform.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │  OSINT Processor│
│   (Next.js)     │    │   (NestJS)      │    │   (Python)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────┬─────┴─────┬─────────────────┐
         │                 │           │                 │
    ┌─────────┐      ┌─────────┐ ┌─────────┐      ┌─────────┐
    │PostgreSQL│      │  Redis  │ │Elasticsearch│      │  Nginx  │
    │Database  │      │  Cache  │ │   Search  │ │  Reverse│
    └─────────┘      └─────────┘ └─────────┘      │  Proxy  │
                                             └─────────┘
```

## Prerequisites

- **Docker & Docker Compose**
- **Domain name** (for SSL)
- **SSL certificates** (Let's Encrypt recommended)
- **Environment variables** configured

## Environment Configuration

### Production Environment Variables

Create `.env.production`:

```bash
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/nse_intelligence_prod
REDIS_URL=redis://redis:6379
ELASTICSEARCH_URL=http://elasticsearch:9200

# Security
JWT_SECRET=your-super-secure-jwt-secret-256-bits
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com

# Email
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=noreply@your-domain.com
SMTP_PASS=your-smtp-password

# Monitoring
LOG_LEVEL=warn
SENTRY_DSN=your-sentry-dsn

# Rate Limiting
REDIS_RATE_LIMIT_URL=redis://redis:6379
```

## Docker Compose Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: nse_intelligence_prod
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped
    networks:
      - internal

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - internal

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=true
      - ELASTIC_PASSWORD=${ELASTIC_PASSWORD}
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    volumes:
      - es_data:/usr/share/elasticsearch/data
    restart: unless-stopped
    networks:
      - internal

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - ELASTICSEARCH_URL=${ELASTICSEARCH_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
      - elasticsearch
    restart: unless-stopped
    networks:
      - internal
      - external

  osint-processor:
    build:
      context: ./osint-processor
      dockerfile: Dockerfile.prod
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - ELASTICSEARCH_URL=${ELASTICSEARCH_URL}
    depends_on:
      - postgres
      - redis
      - elasticsearch
    restart: unless-stopped
    networks:
      - internal

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      args:
        - NEXT_PUBLIC_API_URL=https://api.your-domain.com
        - NEXT_PUBLIC_WS_URL=wss://api.your-domain.com
    restart: unless-stopped
    networks:
      - external

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
    networks:
      - external

volumes:
  postgres_data:
  redis_data:
  es_data:

networks:
  internal:
    driver: bridge
    internal: true
  external:
    driver: bridge
```

## Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3001;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=ws:10m rate=5r/s;

    server {
        listen 80;
        server_name your-domain.com api.your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    server {
        listen 443 ssl http2;
        server_name api.your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket
        location /socket.io/ {
            limit_req zone=ws burst=10 nodelay;
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://backend;
            access_log off;
        }
    }
}
```

## SSL Certificate Setup

### Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Deployment Steps

### 1. Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create project directory
sudo mkdir -p /opt/nse-intelligence
sudo chown $USER:$USER /opt/nse-intelligence
cd /opt/nse-intelligence
```

### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/your-org/nse-intelligence.git .

# Set up environment
cp .env.example .env.production
# Edit .env.production with your values

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npm run migration:run

# Create initial data
docker-compose -f docker-compose.prod.yml exec backend npm run seed:prod
```

### 3. Verify Deployment

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Test API
curl https://api.your-domain.com/health

# Test frontend
curl https://your-domain.com
```

## Monitoring

### Health Checks

Add to `docker-compose.prod.yml`:

```yaml
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
```

### Logging

Configure centralized logging:

```yaml
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"
```

### Metrics (Optional)

Add Prometheus monitoring:

```yaml
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - internal

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - internal
```

## Backup Strategy

### Database Backup

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U postgres nse_intelligence_prod > backup_$DATE.sql
gzip backup_$DATE.sql
aws s3 cp backup_$DATE.sql.gz s3://your-backup-bucket/
EOF

# Schedule daily backups
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## Security Considerations

1. **Firewall**: Only open necessary ports (80, 443)
2. **Updates**: Regularly update Docker images
3. **Secrets**: Use Docker secrets or environment files
4. **Network**: Use internal networks for database access
5. **SSL**: Enforce HTTPS everywhere
6. **Rate Limiting**: Implement API rate limits
7. **Monitoring**: Set up alerting for security events

## Scaling

### Horizontal Scaling

```yaml
  backend:
    deploy:
      replicas: 3
    
  nginx:
    depends_on:
      - backend
```

### Database Scaling

- **Read Replicas**: For read-heavy workloads
- **Connection Pooling**: PgBouncer
- **Caching**: Redis cluster

## Troubleshooting

### Common Issues

1. **Database Connection**: Check network and credentials
2. **Memory Issues**: Monitor container resources
3. **SSL Problems**: Verify certificate paths and permissions
4. **Performance**: Check database queries and indexes

### Debug Commands

```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs backend

# Enter container
docker-compose -f docker-compose.prod.yml exec backend bash

# Monitor resources
docker stats

# Check network connectivity
docker-compose -f docker-compose.prod.yml exec backend ping postgres
```

## Maintenance

### Regular Tasks

- **Weekly**: Update Docker images
- **Monthly**: Review and rotate secrets
- **Quarterly**: Security audit
- **Annually**: Capacity planning

### Rollback Procedure

```bash
# Tag current version
git tag v1.0.0

# Rollback to previous version
git checkout v0.9.0
docker-compose -f docker-compose.prod.yml up -d --build
```

## Support

For production issues:
1. Check logs and monitoring
2. Review this troubleshooting guide
3. Contact support team with detailed error information
