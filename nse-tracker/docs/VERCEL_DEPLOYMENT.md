# Vercel Deployment Guide - Hybrid Approach

This guide explains how to deploy the NSE Intelligence Tracker using the hybrid approach: Backend as Vercel Serverless Functions and Frontend as Static Hosting.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Supabase DB   │
│   (Static)      │◄──►│  (Serverless)   │◄──►│  (PostgreSQL)   │
│   Vercel CDN    │    │   Vercel Edge   │    │   Supabase      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Deployment Steps

### 1. Backend Deployment (Serverless API)

#### 1.1 Prepare Backend
```bash
cd backend
```

#### 1.2 Install Vercel CLI
```bash
npm i -g vercel
```

#### 1.3 Login to Vercel
```bash
vercel login
```

#### 1.4 Deploy Backend
```bash
vercel --prod
```

#### 1.5 Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
```bash
USE_SUPABASE=true
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_DB_URL=postgresql://postgres:password@aws-1-eu-west-1.pooler.supabase.co:6543/postgres
JWT_SECRET=your_super_secure_jwt_secret
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

### 2. Frontend Deployment (Static Hosting)

#### 2.1 Prepare Frontend
```bash
cd frontend
```

#### 2.2 Update API URL
Update `.env.production`:
```bash
REACT_APP_API_URL=https://your-backend-domain.vercel.app/api
```

#### 2.3 Build Frontend
```bash
npm run build
```

#### 2.4 Deploy Frontend
```bash
vercel --prod
```

#### 2.5 Configure Frontend Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
```bash
REACT_APP_API_URL=https://your-backend-domain.vercel.app/api
REACT_APP_ENVIRONMENT=production
```

## Configuration Files

### Backend Configuration

#### `backend/vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.py"
    }
  ],
  "env": {
    "PYTHON_VERSION": "3.9"
  },
  "functions": {
    "api/index.py": {
      "maxDuration": 30
    }
  }
}
```

#### `backend/api/index.py`
```python
#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.main import app
handler = app
```

### Frontend Configuration

#### `frontend/vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_VERSION": "18"
  }
}
```

## Environment Variables

### Backend Production Variables
- `USE_SUPABASE=true`
- `SUPABASE_URL=your_supabase_url`
- `SUPABASE_KEY=your_supabase_anon_key`
- `SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`
- `SUPABASE_DB_URL=your_database_url`
- `JWT_SECRET=your_jwt_secret`
- `ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app`

### Frontend Production Variables
- `REACT_APP_API_URL=https://your-backend-domain.vercel.app/api`
- `REACT_APP_ENVIRONMENT=production`

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (development)
- `https://*.vercel.app` (production)
- Your specific frontend domain

## Performance Optimization

### Backend Optimizations
- Serverless functions auto-scale
- Cold start optimization
- Database connection pooling
- Response caching

### Frontend Optimizations
- Static asset CDN
- Code splitting
- Image optimization
- Browser caching

## Monitoring and Debugging

### Vercel Analytics
- Request metrics
- Performance monitoring
- Error tracking

### Logs
- Function execution logs
- Error logs
- Performance metrics

## Security Considerations

### Backend Security
- JWT authentication
- CORS restrictions
- Rate limiting
- Input validation

### Frontend Security
- HTTPS enforcement
- Content Security Policy
- Environment variable protection

## Cost Optimization

### Serverless Costs
- Pay per invocation
- Execution time billing
- Memory allocation

### Static Hosting
- Free tier available
- Bandwidth limits
- Build minutes

## Troubleshooting

### Common Issues

#### 1. CORS Errors
```bash
# Check ALLOWED_ORIGINS in backend environment variables
# Ensure frontend domain is included
```

#### 2. Database Connection
```bash
# Verify Supabase credentials
# Check connection string format
# Test database accessibility
```

#### 3. Build Failures
```bash
# Check requirements.vercel.txt
# Verify Python version compatibility
# Review build logs
```

#### 4. Function Timeouts
```bash
# Increase maxDuration in vercel.json
# Optimize database queries
# Implement caching
```

## Deployment Commands

### Development
```bash
# Backend
vercel dev

# Frontend
vercel dev --cwd frontend
```

### Production
```bash
# Backend
vercel --prod

# Frontend
vercel --prod --cwd frontend
```

### Environment Management
```bash
# List environments
vercel env ls

# Pull environment variables
vercel env pull .env.production

# Add environment variable
vercel env add VARIABLE_NAME
```

## Custom Domains

### Setup Custom Domains
1. Go to Vercel Dashboard → Project → Domains
2. Add your custom domain
3. Configure DNS records
4. Update CORS origins

### SSL Certificates
- Automatic SSL provisioning
- Certificate renewal
- HTTPS enforcement

## Scaling Considerations

### Backend Scaling
- Serverless auto-scaling
- Database connection limits
- Rate limiting adjustments

### Frontend Scaling
- CDN distribution
- Edge caching
- Global deployment

## Backup and Recovery

### Database Backups
- Supabase automatic backups
- Point-in-time recovery
- Export functionality

### Code Backups
- Git version control
- Vercel project history
- Environment variable backups

## Next Steps

1. **Deploy Backend**: Deploy serverless API to Vercel
2. **Deploy Frontend**: Deploy static frontend to Vercel
3. **Configure DNS**: Set up custom domains
4. **Monitor Performance**: Set up analytics and monitoring
5. **Optimize**: Fine-tune performance and costs

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [React Documentation](https://reactjs.org/docs)
