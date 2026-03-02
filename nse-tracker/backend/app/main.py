
"""
NSE Intelligence Tracker - FastAPI Main Application

This is the main entry point for the NSE Intelligence Tracker backend API.
It provides endpoints for authentication, news management, stock tracking,
and portfolio management.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.httpsredirect import HTTPSRedirectMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import structlog
import time

from app.core.config import settings
from app.core.database import engine, Base
from app.deps import get_db, get_redis
from app.routers import auth, news, stocks, portfolio
from app.tasks.celery_app import celery_app
from app.services.realtime import realtime_service
from app.core.websocket import manager, broadcast_stock_update, broadcast_news_alert, broadcast_market_sentiment

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("Starting NSE Intelligence Tracker API")
    
    # Create database tables
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error("Failed to create database tables", error=str(e))
        raise
    
    yield
    
    logger.info("Shutting down NSE Intelligence Tracker API")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="OSINT-style Nairobi Stock Exchange tracking API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware for production
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "*.yourdomain.com"]
    )

# Security middlewares (HTTPS redirect disabled for development)
# app.add_middleware(HTTPSRedirectMiddleware)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['Content-Security-Policy'] = "default-src 'self'"
        return response

app.add_middleware(SecurityHeadersMiddleware)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time header to responses."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(news.router, prefix="/api/news", tags=["News"])
app.include_router(stocks.router, prefix="/api/stocks", tags=["Stocks"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["Portfolio"])


# WebSocket endpoints for real-time data
@app.websocket("/ws/stocks")
async def stocks_websocket(websocket: WebSocket):
    """WebSocket endpoint for real-time stock data."""
    await manager.connect(websocket, "stocks")
    try:
        while True:
            # Keep connection alive and handle client messages
            data = await websocket.receive_text()
            # Handle client subscriptions or commands if needed
            await manager.send_personal_message(
                {"type": "subscription_confirmed", "topic": "stocks"},
                websocket
            )
    except Exception as e:
        logger.error("WebSocket error", error=str(e))
    finally:
        manager.disconnect(websocket, "stocks")


@app.websocket("/ws/news")
async def news_websocket(websocket: WebSocket):
    """WebSocket endpoint for real-time news alerts."""
    await manager.connect(websocket, "news")
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(
                {"type": "subscription_confirmed", "topic": "news"},
                websocket
            )
    except Exception as e:
        logger.error("WebSocket error", error=str(e))
    finally:
        manager.disconnect(websocket, "news")


@app.websocket("/ws/market")
async def market_websocket(websocket: WebSocket):
    """WebSocket endpoint for real-time market data."""
    await manager.connect(websocket, "market")
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(
                {"type": "subscription_confirmed", "topic": "market"},
                websocket
            )
    except Exception as e:
        logger.error("WebSocket error", error=str(e))
    finally:
        manager.disconnect(websocket, "market")


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "NSE Intelligence Tracker API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Check database connection
        db = next(get_db())
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        logger.error("Database health check failed", error=str(e))
        db_status = "unhealthy"
    
    try:
        # Check Redis connection
        redis = get_redis()
        redis.ping()
        redis_status = "healthy"
    except Exception as e:
        logger.error("Redis health check failed", error=str(e))
        redis_status = "unhealthy"
    
    # Check Celery
    try:
        celery_status = "healthy" if celery_app.control.inspect().stats() else "unhealthy"
    except Exception as e:
        logger.error("Celery health check failed", error=str(e))
        celery_status = "unhealthy"
    
    # Check Supabase if configured
    supabase_status = "not_configured"
    if settings.USE_SUPABASE:
        try:
            from app.core.supabase import get_supabase_client
            supabase_client = get_supabase_client()
            if supabase_client:
                # Test Supabase connection
                response = supabase_client.from_('users').select('count').execute()
                supabase_status = "healthy"
            else:
                supabase_status = "unhealthy"
        except Exception as e:
            logger.error("Supabase health check failed", error=str(e))
            supabase_status = "unhealthy"
    
    overall_status = "healthy" if all(
        status == "healthy" for status in [db_status, redis_status, celery_status] + 
        ([supabase_status] if settings.USE_SUPABASE else [])
    ) else "unhealthy"
    
    # Get database info
    from app.core.database import get_database_info
    db_info = get_database_info()
    
    return JSONResponse(
        status_code=200 if overall_status == "healthy" else 503,
        content={
            "status": overall_status,
            "timestamp": time.time(),
            "services": {
                "database": db_status,
                "redis": redis_status,
                "celery": celery_status,
                "supabase": supabase_status if settings.USE_SUPABASE else "disabled"
            },
            "database_info": db_info,
            "version": settings.APP_VERSION
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    logger.error(
        "Unhandled exception",
        path=request.url.path,
        method=request.method,
        error=str(exc),
        exc_info=True
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "path": request.url.path
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
