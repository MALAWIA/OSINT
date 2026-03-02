"""
Supabase database configuration and connection management.

This module provides Supabase integration for the NSE Intelligence Tracker,
offering a managed PostgreSQL database with real-time capabilities.
"""

import os
from typing import Optional, Dict, Any, List
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import structlog
from supabase import create_client, Client
# from postgrest import PostgrestClient  # Removed - not needed

from app.core.config import settings

logger = structlog.get_logger()

# Supabase client
supabase_client: Optional[Client] = None
supabase_engine = None
SupabaseSessionLocal = None
SupabaseBase = declarative_base()


def initialize_supabase() -> bool:
    """
    Initialize Supabase client and database connection.
    
    Returns:
        bool: True if initialization successful, False otherwise
    """
    global supabase_client, supabase_engine, SupabaseSessionLocal
    
    try:
        if not settings.USE_SUPABASE or not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
            logger.info("Supabase not configured, using default database")
            return False
        
        # Initialize Supabase client
        supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )
        
        # Test API connection first
        logger.info("Testing Supabase API connection...")
        response = supabase_client.from_('users').select('count').execute()
        logger.info("Supabase API connection successful")
        
        # Try database connection if URL is provided
        if settings.SUPABASE_DB_URL:
            try:
                db_url = settings.SUPABASE_DB_URL
                
                # Create SQLAlchemy engine for Supabase
                supabase_engine = create_engine(
                    db_url,
                    pool_pre_ping=True,
                    pool_recycle=300,
                    echo=settings.DEBUG,
                    connect_args={
                        "sslmode": "require",
                        "connect_timeout": 10,
                    }
                )
                
                # Create session factory
                SupabaseSessionLocal = sessionmaker(
                    autocommit=False, 
                    autoflush=False, 
                    bind=supabase_engine
                )
                
                # Test database connection
                with supabase_engine.connect() as conn:
                    result = conn.execute(text("SELECT 1"))
                    logger.info("Supabase database connection successful")
                    
            except Exception as db_error:
                logger.warning(f"Database connection failed but API works: {str(db_error)}")
                logger.info("Using Supabase API only (database operations will use API)")
                # Continue with API-only mode
        
        logger.info(
            "Supabase initialized successfully",
            url=settings.SUPABASE_URL,
            use_db_url=bool(settings.SUPABASE_DB_URL)
        )
        return True
        
    except Exception as e:
        logger.error(
            "Failed to initialize Supabase",
            error=str(e),
            has_url=bool(settings.SUPABASE_URL),
            has_key=bool(settings.SUPABASE_KEY)
        )
        return False


def get_supabase_client() -> Optional[Client]:
    """
    Get Supabase client instance.
    
    Returns:
        Optional[Client]: Supabase client or None if not initialized
    """
    global supabase_client
    if supabase_client is None:
        initialize_supabase()
    return supabase_client


def get_supabase_db() -> Optional[Session]:
    """
    Get Supabase database session.
    
    Yields:
        Optional[Session]: Database session or None if not initialized
    """
    global SupabaseSessionLocal
    
    if SupabaseSessionLocal is None:
        if not initialize_supabase():
            return None
    
    db = SupabaseSessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error("Supabase database session error", error=str(e))
        db.rollback()
        raise
    finally:
        db.close()


def create_supabase_tables():
    """Create all database tables in Supabase."""
    try:
        if supabase_engine is None:
            if not initialize_supabase():
                raise Exception("Supabase not initialized")
        
        SupabaseBase.metadata.create_all(bind=supabase_engine)
        logger.info("Supabase database tables created successfully")
        
    except Exception as e:
        logger.error("Failed to create Supabase database tables", error=str(e))
        raise


def drop_supabase_tables():
    """Drop all database tables in Supabase."""
    try:
        if supabase_engine is None:
            if not initialize_supabase():
                raise Exception("Supabase not initialized")
        
        SupabaseBase.metadata.drop_all(bind=supabase_engine)
        logger.info("Supabase database tables dropped successfully")
        
    except Exception as e:
        logger.error("Failed to drop Supabase database tables", error=str(e))
        raise


class SupabaseQueryBuilder:
    """Helper class for building Supabase queries."""
    
    def __init__(self, table_name: str):
        self.table_name = table_name
        self.client = get_supabase_client()
        
    def select(self, columns: str = "*", count: Optional[str] = None) -> 'SupabaseQueryBuilder':
        """Select columns from table."""
        self._query = self.client.from_(self.table_name).select(columns, count=count)
        return self
        
    def insert(self, data: Dict[str, Any] | List[Dict[str, Any]]) -> 'SupabaseQueryBuilder':
        """Insert data into table."""
        self._query = self.client.from_(self.table_name).insert(data)
        return self
        
    def update(self, data: Dict[str, Any]) -> 'SupabaseQueryBuilder':
        """Update data in table."""
        self._query = self.client.from_(self.table_name).update(data)
        return self
        
    def delete(self) -> 'SupabaseQueryBuilder':
        """Delete from table."""
        self._query = self.client.from_(self.table_name).delete()
        return self
        
    def eq(self, column: str, value: Any) -> 'SupabaseQueryBuilder':
        """Filter by equality."""
        self._query = self._query.eq(column, value)
        return self
        
    def neq(self, column: str, value: Any) -> 'SupabaseQueryBuilder':
        """Filter by inequality."""
        self._query = self._query.neq(column, value)
        return self
        
    def gt(self, column: str, value: Any) -> 'SupabaseQueryBuilder':
        """Filter by greater than."""
        self._query = self._query.gt(column, value)
        return self
        
    def gte(self, column: str, value: Any) -> 'SupabaseQueryBuilder':
        """Filter by greater than or equal."""
        self._query = self._query.gte(column, value)
        return self
        
    def lt(self, column: str, value: Any) -> 'SupabaseQueryBuilder':
        """Filter by less than."""
        self._query = self._query.lt(column, value)
        return self
        
    def lte(self, column: str, value: Any) -> 'SupabaseQueryBuilder':
        """Filter by less than or equal."""
        self._query = self._query.lte(column, value)
        return self
        
    def like(self, column: str, pattern: str) -> 'SupabaseQueryBuilder':
        """Filter by pattern."""
        self._query = self._query.like(column, pattern)
        return self
        
    def ilike(self, column: str, pattern: str) -> 'SupabaseQueryBuilder':
        """Filter by case-insensitive pattern."""
        self._query = self._query.ilike(column, pattern)
        return self
        
    def is_(self, column: str, value: Any) -> 'SupabaseQueryBuilder':
        """Filter by exact match including null."""
        self._query = self._query.is_(column, value)
        return self
        
    def in_(self, column: str, values: List[Any]) -> 'SupabaseQueryBuilder':
        """Filter by values in list."""
        self._query = self._query.in_(column, values)
        return self
        
    def order(self, column: str, desc: bool = False) -> 'SupabaseQueryBuilder':
        """Order results."""
        self._query = self._query.order(column, desc=desc)
        return self
        
    def limit(self, count: int) -> 'SupabaseQueryBuilder':
        """Limit results."""
        self._query = self._query.limit(count)
        return self
        
    def offset(self, count: int) -> 'SupabaseQueryBuilder':
        """Offset results."""
        self._query = self._query.offset(count)
        return self
        
    def execute(self):
        """Execute the query."""
        return self._query.execute()


def table(table_name: str) -> SupabaseQueryBuilder:
    """
    Create a query builder for a Supabase table.
    
    Args:
        table_name: Name of the table
        
    Returns:
        SupabaseQueryBuilder: Query builder instance
    """
    return SupabaseQueryBuilder(table_name)


# Initialize Supabase on module import
if settings.USE_SUPABASE:
    initialize_supabase()
