"""
Database configuration and session management.

This module sets up the SQLAlchemy database engine, session management,
and provides dependency injection for FastAPI endpoints.
Supports both regular PostgreSQL and Supabase.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import structlog

from app.core.config import settings
from app.core.supabase import initialize_supabase, get_supabase_db

logger = structlog.get_logger()

# Determine which database to use
USE_SUPABASE = settings.USE_SUPABASE and bool(settings.SUPABASE_URL) and bool(settings.SUPABASE_KEY)

# Create database engine based on configuration
if USE_SUPABASE:
    # Use Supabase database URL if available, otherwise construct from settings
    db_url = settings.SUPABASE_DB_URL or settings.DATABASE_URL
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=settings.DEBUG,
        connect_args={
            "sslmode": "require",
            "connect_timeout": 10,
        }
    )
    logger.info("Using Supabase database connection")
else:
    # Use regular PostgreSQL
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=settings.DEBUG
    )
    logger.info("Using regular PostgreSQL database connection")

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()


def get_db() -> Session:
    """
    Dependency function to get database session.
    
    Yields:
        Session: Database session
    """
    if USE_SUPABASE:
        # Use Supabase if available
        supabase_session = next(get_supabase_db())
        if supabase_session:
            yield supabase_session
            return
    
    # Fallback to regular database
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error("Database session error", error=str(e))
        db.rollback()
        raise
    finally:
        db.close()


def create_tables():
    """Create all database tables."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
        # Also create Supabase tables if using Supabase
        if USE_SUPABASE:
            from app.core.supabase import create_supabase_tables
            create_supabase_tables()
            
    except Exception as e:
        logger.error("Failed to create database tables", error=str(e))
        raise


def drop_tables():
    """Drop all database tables."""
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("Database tables dropped successfully")
        
        # Also drop Supabase tables if using Supabase
        if USE_SUPABASE:
            from app.core.supabase import drop_supabase_tables
            drop_supabase_tables()
            
    except Exception as e:
        logger.error("Failed to drop database tables", error=str(e))
        raise


def get_database_info() -> dict:
    """
    Get information about the current database configuration.
    
    Returns:
        dict: Database configuration info
    """
    return {
        "use_supabase": USE_SUPABASE,
        "database_type": "Supabase PostgreSQL" if USE_SUPABASE else "PostgreSQL",
        "supabase_configured": bool(settings.SUPABASE_URL and settings.SUPABASE_KEY),
        "connection_url": settings.SUPABASE_DB_URL if USE_SUPABASE else settings.DATABASE_URL
    }
