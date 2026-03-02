"""
Application configuration settings using Pydantic Settings.

This module manages all environment variables and configuration
parameters for the NSE Intelligence Tracker application.
"""

from typing import List, Optional
from pydantic import Field, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    APP_NAME: str = Field(default="NSE Intelligence Tracker", env="APP_NAME")
    APP_VERSION: str = Field(default="1.0.0", env="APP_VERSION")
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # Database
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    POSTGRES_PASSWORD: str = Field(..., env="POSTGRES_PASSWORD")
    POSTGRES_USER: str = Field(..., env="POSTGRES_USER")
    POSTGRES_DB: str = Field(..., env="POSTGRES_DB")
    
    # Supabase Configuration
    SUPABASE_URL: str = Field(default="", env="SUPABASE_URL")
    SUPABASE_KEY: str = Field(default="", env="SUPABASE_KEY")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(default="", env="SUPABASE_SERVICE_ROLE_KEY")
    SUPABASE_DB_URL: str = Field(default="", env="SUPABASE_DB_URL")
    USE_SUPABASE: bool = Field(default=False, env="USE_SUPABASE")
    
    # Redis
    REDIS_URL: str = Field(..., env="REDIS_URL")
    
    # JWT Authentication
    JWT_SECRET: str = Field(..., env="JWT_SECRET")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # External API Keys
    NEWSAPI_KEY: Optional[str] = Field(default=None, env="NEWSAPI_KEY")
    ALPHAVANTAGE_KEY: Optional[str] = Field(default=None, env="ALPHAVANTAGE_KEY")
    
    # CORS
    ALLOWED_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:3000", 
            "http://127.0.0.1:3000",
            "https://*.vercel.app",
            "https://your-domain.vercel.app"
        ],
        env="ALLOWED_ORIGINS"
    )
    
    @validator("ALLOWED_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        """Parse CORS origins from comma-separated string."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=30, env="RATE_LIMIT_PER_MINUTE")
    
    # Cache TTL (in seconds)
    NEWS_CACHE_TTL: int = Field(default=1800, env="NEWS_CACHE_TTL")  # 30 minutes
    STOCK_CACHE_TTL: int = Field(default=300, env="STOCK_CACHE_TTL")  # 5 minutes
    
    # Celery
    CELERY_BROKER_URL: str = Field(default="redis://redis:6379/0", env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str = Field(default="redis://redis:6379/0", env="CELERY_RESULT_BACKEND")
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(default="json", env="LOG_FORMAT")
    
    # News Sources
    GOOGLE_NEWS_QUERY: str = Field(
        default="Nairobi Stock Exchange OR NSE OR Kenya market",
        env="GOOGLE_NEWS_QUERY"
    )
    NEWS_SOURCES: List[str] = Field(
        default=[
            "businessdailyafrica.com",
            "standardmedia.co.ke",
            "nation.africa",
            "citizentv.co.ke",
            "kbc.co.ke"
        ],
        env="NEWS_SOURCES"
    )
    
    @validator("NEWS_SOURCES", pre=True)
    def parse_news_sources(cls, v):
        """Parse news sources from comma-separated string."""
        if isinstance(v, str):
            return [source.strip() for source in v.split(",")]
        return v
    
    # Stock Data
    NSE_SYMBOLS: List[str] = Field(
        default=[
            "SCOM", "EQTY", "KCB", "COOP", "NCBA", "ABSA", "DTK", "JUB", 
            "BAT", "EABL", "UAP", "CFC", "ICDC", "NMG", "TPS", "WPP",
            "BAMB", "BRK", "GDC", "HFG", "KAPC", "LONMOT", "MUMIAS", 
            "NSEL", "OLGE", "PORTLAND", "RVA", "SAS", "TSL", "UMASH"
        ],
        env="NSE_SYMBOLS"
    )
    
    @validator("NSE_SYMBOLS", pre=True)
    def parse_nse_symbols(cls, v):
        """Parse NSE symbols from comma-separated string."""
        if isinstance(v, str):
            return [symbol.strip() for symbol in v.split(",")]
        return v
    
    # External API URLs
    NEWSAPI_BASE_URL: str = Field(
        default="https://newsapi.org/v2",
        env="NEWSAPI_BASE_URL"
    )
    ALPHAVANTAGE_BASE_URL: str = Field(
        default="https://www.alphavantage.co/query",
        env="ALPHAVANTAGE_BASE_URL"
    )
    
    # Task Configuration
    NEWS_FETCH_INTERVAL_MINUTES: int = Field(
        default=30,
        env="NEWS_FETCH_INTERVAL_MINUTES"
    )
    STOCK_FETCH_INTERVAL_MINUTES: int = Field(
        default=5,
        env="STOCK_FETCH_INTERVAL_MINUTES"
    )
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()
