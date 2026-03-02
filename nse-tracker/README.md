# NSE Intelligence Tracker

A comprehensive OSINT-style Nairobi Stock Exchange tracking web application that provides real-time market intelligence, news aggregation, and portfolio management.

## 🚀 Features

- **Real-time NSE Stock Tracking**: Monitor stock prices, trends, and market data
- **OSINT News Aggregation**: Automated collection of NSE-related news from multiple sources
- **Virtual Portfolio Management**: Create and manage stock watchlists and portfolios
- **Advanced Search**: Full-text search across news articles and stock data
- **Real-time Updates**: Celery-powered background tasks for data synchronization
- **Secure Authentication**: JWT-based user authentication with proper security measures

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI + Python 3.11 + Pydantic + SQLAlchemy 2.0
- **Database**: PostgreSQL with Redis for caching
- **Task Queue**: Celery with Redis broker
- **Containerization**: Docker Compose for local development
- **External APIs**: Google News RSS, NewsAPI.org, Alpha Vantage

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
- API Keys (see Environment Variables section)

## 🛠️ Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd nse-tracker
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

3. **Run with Docker Compose**:
   ```bash
   docker compose up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Database
POSTGRES_PASSWORD=your_secure_password
POSTGRES_USER=nse_tracker
POSTGRES_DB=nse_tracker
DATABASE_URL=postgresql://nse_tracker:your_secure_password@postgres:5432/nse_tracker

# Redis
REDIS_URL=redis://redis:6379/0

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# External APIs
NEWSAPI_KEY=your_newsapi_key_here
ALPHAVANTAGE_KEY=your_alphavantage_key_here

# Application
APP_NAME=NSE Intelligence Tracker
APP_VERSION=1.0.0
DEBUG=true
```

## 📊 API Keys Setup

### NewsAPI.org
1. Sign up at https://newsapi.org/
2. Get your free API key
3. Add `NEWSAPI_KEY` to your `.env` file

### Alpha Vantage
1. Sign up at https://www.alphavantage.co/
2. Get your free API key
3. Add `ALPHAVANTAGE_KEY` to your `.env` file

## 🧪 Testing

### Backend Tests
```bash
# Run all backend tests
docker compose exec backend pytest

# Run with coverage
docker compose exec backend pytest --cov=app

# Run specific test
docker compose exec backend pytest tests/test_auth.py
```

### Frontend Tests
```bash
# Run frontend tests
docker compose exec frontend npm test

# Run with coverage
docker compose exec frontend npm run test:coverage
```

## 📁 Project Structure

```
nse-tracker/
├─ backend/
│  ├─ app/
│  │  ├─ main.py                # FastAPI entry point
│  │  ├─ deps.py                # Database/Redis dependencies
│  │  ├─ models/
│  │  │  ├─ user.py
│  │  │  ├─ news.py
│  │  │  ├─ stock.py
│  │  │  └─ portfolio.py
│  │  ├─ schemas/
│  │  │  └─ *.py                # Pydantic schemas
│  │  ├─ routers/
│  │  │  ├─ auth.py
│  │  │  ├─ news.py
│  │  │  ├─ stocks.py
│  │  │  └─ portfolio.py
│  │  ├─ services/
│  │  │  ├─ news_service.py
│  │  │  └─ stock_service.py
│  │  └─ tasks/
│  │     └─ fetch_news.py
│  ├─ tests/
│  ├─ Dockerfile
│  ├─ requirements.txt
│  └─ alembic/                 # Database migrations
├─ frontend/
│  ├─ src/
│  │  ├─ App.tsx
│  │  ├─ pages/
│  │  │   ├─ News.tsx
│  │  │   ├─ Watchlist.tsx
│  │  │   └─ Portfolio.tsx
│  │  ├─ components/
│  │  │   ├─ Navbar.tsx
│  │  │   ├─ NewsCard.tsx
│  │  │   └─ DisclaimerBanner.tsx
│  │  ├─ hooks/
│  │  └─ api/
│  ├─ public/
│  ├─ vite.config.ts
│  ├─ tailwind.config.cjs
│  └─ Dockerfile
├─ docker-compose.yml
├─ .env.example
├─ .github/
│  └─ workflows/
│      └─ ci.yml
└── README.md
```

## 🚀 Deployment

### Local Development
```bash
# Start all services
docker compose up --build

# Start in detached mode
docker compose up -d --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Production Deployment

#### Option 1: Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml nse-tracker
```

#### Option 2: Kubernetes
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/
```

#### Option 3: Cloud Services
- **Render**: Deploy backend and PostgreSQL
- **Vercel/Netlify**: Deploy frontend
- **Redis Cloud**: Managed Redis instance

## 📈 Monitoring

### Health Checks
- Backend: `GET /health`
- Database: Connection status in health check
- Redis: Connection status in health check

### Logs
```bash
# View backend logs
docker compose logs -f backend

# View frontend logs
docker compose logs -f frontend

# View Celery logs
docker compose logs -f celery
```

## 🔒 Security

- JWT authentication with HttpOnly cookies
- Rate limiting (30 requests/minute per IP)
- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy
- CORS configuration for frontend access
- Environment variable encryption

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

**This application is not a trading platform. It only provides publicly available market data for informational purposes.**

- No real trading capabilities
- No financial advice provided
- Data may be delayed or inaccurate
- Always consult with financial professionals before making investment decisions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation at `/docs`
- Review the troubleshooting guide in the wiki
