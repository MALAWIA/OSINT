import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from config import DATABASE_URL

logger = logging.getLogger(__name__)

def create_tables():
    """Create necessary database tables"""
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        
        with conn.cursor() as cursor:
            # Create news articles table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS news_articles (
                    id SERIAL PRIMARY KEY,
                    title TEXT NOT NULL,
                    summary TEXT,
                    content TEXT NOT NULL,
                    source VARCHAR(255) NOT NULL,
                    source_url VARCHAR(500),
                    published_at TIMESTAMP,
                    sentiment_score DECIMAL(3,2),
                    sentiment_label VARCHAR(20),
                    sentiment_confidence DECIMAL(3,2),
                    is_processed BOOLEAN DEFAULT FALSE,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create companies table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS companies (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    ticker VARCHAR(10) UNIQUE NOT NULL,
                    sector VARCHAR(100),
                    description TEXT,
                    website VARCHAR(500),
                    stock_price DECIMAL(10,2),
                    market_cap BIGINT,
                    volume BIGINT,
                    change DECIMAL(10,2),
                    change_percent DECIMAL(5,2),
                    last_updated TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            logger.info("Database tables created successfully")
        
        # Insert sample companies (simplified)
        sample_companies = [
            ('Safaricom PLC', 'SCOM', 'Telecommunications', 'https://www.safaricom.co.ke'),
        ]
        
        with conn.cursor() as cursor:
            for company in sample_companies:
                cursor.execute("""
                    INSERT INTO companies (name, ticker, sector, description, website)
                    VALUES (%s, %s, %s, %s)
                """, company)
        
        conn.close()
        logger.info("Database initialization completed successfully")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

if __name__ == "__main__":
    create_tables()
