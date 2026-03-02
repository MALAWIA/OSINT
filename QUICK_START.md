# 🚀 NSE Intelligence Platform - Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites
- Docker & Docker Compose installed
- Git installed
- 4GB+ RAM available
- Open ports: 3000, 3001, 5432, 6379, 9200

### 1. Clone & Setup
```bash
git clone https://github.com/your-org/nse-intelligence.git
cd nse-intelligence
cp .env.example .env
```

### 2. Configure Environment
Edit `.env` with your settings:
```bash
# Database (keep defaults for dev)
DATABASE_URL=postgresql://nse_user:nse_password@localhost:5432/nse_intelligence
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200

# Security (change in production)
JWT_SECRET=your-super-secret-jwt-key

# URLs
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### 3. Launch Platform
```bash
docker-compose up -d
```

### 4. Verify Setup
```bash
# Check services
docker-compose ps

# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api/docs
# Health Check: http://localhost:3001/health
```

### 5. Create Admin Account
```bash
# Register first user at http://localhost:3000
# Manually set admin flag in database:
docker-compose exec postgres psql -U nse_user -d nse_intelligence -c "UPDATE users SET is_admin = true WHERE email = 'your@email.com';"
```

## 🎯 First Steps

### 1. Explore the Platform
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:3001/api/docs
- **Admin Dashboard**: Login and navigate to Analytics

### 2. Test OSINT Collection
```bash
# Manually trigger collection
docker-compose exec osint-processor python -c "from collectors import run_collection; run_collection()"

# Check collected news
docker-compose exec postgres psql -U nse_user -d nse_intelligence -c "SELECT COUNT(*) FROM news_articles;"
```

### 3. Test Processing
```bash
# Process collected articles
docker-compose exec osint-processor python -c "from processors import run_processing; run_processing()"

# Check sentiment analysis
docker-compose exec postgres psql -U nse_user -d nse_intelligence -c "SELECT COUNT(*) FROM sentiment_analysis;"
```

### 4. Test Real-time Features
- Open frontend in two browser windows
- Join a discussion channel
- Send messages - they should appear in real-time

## 🔧 Common Issues & Solutions

### Database Connection Issues
```bash
# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres

# Manual connection test
docker-compose exec postgres psql -U nse_user -d nse_intelligence -c "SELECT version();"
```

### Frontend Not Loading
```bash
# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Check logs
docker-compose logs frontend
```

### OSINT Processor Not Working
```bash
# Check Python dependencies
docker-compose exec osint-processor pip list

# Manual test
docker-compose exec osint-processor python main.py

# Check logs
docker-compose logs osint-processor
```

### WebSocket Connection Issues
```bash
# Check backend logs
docker-compose logs backend

# Verify port accessibility
curl http://localhost:3001/health

# Test WebSocket
wscat -c ws://localhost:3001/socket.io/
```

## 📊 Verify Functionality

### 1. News Collection
```sql
-- Check news articles
SELECT COUNT(*) as total_articles, 
       COUNT(CASE WHEN is_processed = true THEN 1 END) as processed
FROM news_articles;

-- Recent articles
SELECT title, source_name, published_at 
FROM news_articles na 
JOIN news_sources ns ON na.source_id = ns.id 
ORDER BY published_at DESC LIMIT 5;
```

### 2. Sentiment Analysis
```sql
-- Sentiment summary
SELECT sentiment_label, COUNT(*) as count
FROM sentiment_analysis 
GROUP BY sentiment_label;

-- Company sentiment
SELECT c.ticker, AVG(sa.sentiment_score) as avg_sentiment
FROM sentiment_analysis sa
JOIN companies c ON sa.company_id = c.id
GROUP BY c.ticker
ORDER BY avg_sentiment DESC;
```

### 3. User Activity
```sql
-- User count
SELECT COUNT(*) as total_users FROM users;

-- Message activity
SELECT COUNT(*) as total_messages FROM messages;
```

## 🎨 Customization

### Add Custom News Sources
```sql
INSERT INTO news_sources (name, url, rss_url, source_type)
VALUES ('Your News Source', 'https://your-source.com', 'https://your-source.com/feed', 'rss');
```

### Add New Companies
```sql
INSERT INTO companies (ticker, name, sector, description)
VALUES ('NEW', 'New Company PLC', 'Technology', 'A new technology company');
```

### Create Discussion Channels
```sql
INSERT INTO discussion_channels (name, channel_type, company_id, description)
VALUES ('$NEW', 'stock', (SELECT id FROM companies WHERE ticker = 'NEW'), 'Discussion for New Company');
```

## 🔍 Monitoring & Debugging

### Check Service Health
```bash
# All services status
docker-compose ps

# Resource usage
docker stats

# Logs for all services
docker-compose logs -f
```

### Database Monitoring
```bash
# Connection count
docker-compose exec postgres psql -U nse_user -d nse_intelligence -c "SELECT count(*) FROM pg_stat_activity;"

# Table sizes
docker-compose exec postgres psql -U nse_user -d nse_intelligence -c "SELECT schemaname,tablename,attname,n_distinct,correlation FROM pg_stats;"

# Slow queries
docker-compose exec postgres psql -U nse_user -d nse_intelligence -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 5;"
```

### Application Logs
```bash
# Backend logs
docker-compose logs -f backend

# OSINT processor logs
docker-compose logs -f osint-processor

# Frontend logs
docker-compose logs -f frontend
```

## 🚀 Production Deployment

### 1. Environment Preparation
```bash
# Copy production config
cp .env.example .env.production

# Edit production values
nano .env.production
```

### 2. SSL Setup
```bash
# Using Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

### 3. Deploy
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose exec backend npm run migration:run

# Seed production data
docker-compose exec backend npm run seed:prod
```

## 📞 Need Help?

### Documentation
- **API Documentation**: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- **Deployment Guide**: [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)
- **Compliance Guide**: [docs/COMPLIANCE_GUIDE.md](docs/COMPLIANCE_GUIDE.md)
- **User Guide**: [docs/USER_GUIDE.md](docs/USER_GUIDE.md)

### Common Commands
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild everything
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Access individual services
docker-compose exec backend bash
docker-compose exec postgres psql -U nse_user -d nse_intelligence
docker-compose exec redis redis-cli
```

### Troubleshooting Checklist
- [ ] Docker and Docker Compose installed
- [ ] Ports 3000, 3001, 5432, 6379, 9200 available
- [ ] Environment variables configured
- [ ] Docker images built successfully
- [ ] Database initialized
- [ ] Services running without errors
- [ ] Frontend accessible in browser
- [ ] API responding to requests
- [ ] WebSocket connections working

---

**🎉 You're all set!** The NSE Intelligence Platform is now running and ready for use.

**Next Steps:**
1. Explore the frontend interface
2. Test news collection and processing
3. Try the real-time chat features
4. Review the API documentation
5. Customize for your specific needs
