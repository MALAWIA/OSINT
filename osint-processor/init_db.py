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
            # Create news sources table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS news_sources (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    url VARCHAR(500) NOT NULL,
                    source_type VARCHAR(50) NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    config JSONB,
                    article_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
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
            
            # Create company mentions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS company_mentions (
                    id SERIAL PRIMARY KEY,
                    article_id INTEGER REFERENCES news_articles(id),
                    company_id INTEGER REFERENCES companies(id),
                    mention_text VARCHAR(255),
                    position INTEGER,
                    confidence DECIMAL(3,2),
                    is_primary BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create detected events table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS detected_events (
                    id SERIAL PRIMARY KEY,
                    article_id INTEGER REFERENCES news_articles(id),
                    company_id INTEGER REFERENCES companies(id),
                    event_type VARCHAR(50),
                    event_text VARCHAR(500),
                    confidence DECIMAL(3,2),
                    metadata JSONB,
                    is_verified BOOLEAN DEFAULT FALSE,
                    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create sentiment analysis table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sentiment_analysis (
                    id SERIAL PRIMARY KEY,
                    article_id INTEGER REFERENCES news_articles(id),
                    company_id INTEGER REFERENCES companies(id),
                    sentiment_score DECIMAL(3,2),
                    sentiment_label VARCHAR(20),
                    confidence DECIMAL(3,2),
                    entities JSONB,
                    keywords JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            logger.info("Database tables created successfully")
        
        # Insert sample companies
        sample_companies = [
            ('Safaricom PLC', 'SCOM', 'Telecommunications', 'Leading telecommunications company in Kenya', 'https://www.safaricom.co.ke', 25.75, 1025000000000, 1500000, 0.25, 0.98),
            ('Equity Group Holdings', 'EQTY', 'Banking', 'Largest banking group in Kenya', 'https://www.equitygroup.co.ke', 48.50, 185000000000, 800000, -0.75, -1.52),
            ('KCB Group', 'KCB', 'Banking', 'Kenya Commercial Bank Group', 'https://www.kcbgroup.com', 42.25, 142000000000, 650000, 0.50, 1.20),
        ]
        
        with conn.cursor() as cursor:
            cursor.executemany("""
                INSERT INTO companies (name, ticker, sector, description, website, stock_price, market_cap, volume, change, change_percent)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (ticker) DO NOTHING
            """, sample_companies)
        
        # Insert sample news sources
        sample_sources = [
            ('Business Daily', 'https://www.businessdailyafrica.com', 'rss', True),
            ('Nation Media', 'https://www.nation.africa', 'rss', True),
            ('Capital FM', 'https://www.capitalfm.co.ke', 'rss', True),
        ]
        
        with conn.cursor() as cursor:
            cursor.executemany("""
                INSERT INTO news_sources (name, url, source_type, is_active)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (name) DO NOTHING
            """, sample_sources)
        
        conn.close()
        logger.info("Database initialization completed successfully")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

if __name__ == "__main__":
    create_tables()
