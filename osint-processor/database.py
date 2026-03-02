import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from config import DATABASE_URL

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.connection = None
        self.connect()
    
    def connect(self):
        try:
            self.connection = psycopg2.connect(DATABASE_URL)
            self.connection.autocommit = True
            logger.info("Connected to database successfully")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
    
    def disconnect(self):
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")
    
    def execute_query(self, query, params=None):
        try:
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                if query.strip().upper().startswith('SELECT'):
                    return cursor.fetchall()
                else:
                    return cursor.rowcount
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            raise
    
    def get_news_sources(self):
        query = "SELECT * FROM news_sources WHERE is_active = true"
        return self.execute_query(query)
    
    def insert_news_article(self, source_id, title, url, raw_text, published_at, content_hash):
        query = """
        INSERT INTO news_articles (source_id, title, url, raw_text, published_at, content_hash)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON CONFLICT (url) DO NOTHING
        RETURNING id
        """
        try:
            result = self.execute_query(query, (source_id, title, url, raw_text, published_at, content_hash))
            return result[0]['id'] if result else None
        except Exception as e:
            logger.error(f"Failed to insert news article: {e}")
            return None
    
    def get_companies(self):
        query = "SELECT * FROM companies WHERE is_active = true"
        return self.execute_query(query)
    
    def insert_company_mention(self, article_id, company_id, mention_count, confidence_score):
        query = """
        INSERT INTO company_mentions (article_id, company_id, mention_count, confidence_score)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (article_id, company_id) 
        DO UPDATE SET 
            mention_count = EXCLUDED.mention_count,
            confidence_score = EXCLUDED.confidence_score
        RETURNING id
        """
        try:
            result = self.execute_query(query, (article_id, company_id, mention_count, confidence_score))
            return result[0]['id'] if result else None
        except Exception as e:
            logger.error(f"Failed to insert company mention: {e}")
            return None
    
    def insert_sentiment_analysis(self, article_id, company_id, sentiment_score, sentiment_label, confidence):
        query = """
        INSERT INTO sentiment_analysis (article_id, company_id, sentiment_score, sentiment_label, confidence)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
        """
        try:
            result = self.execute_query(query, (article_id, company_id, sentiment_score, sentiment_label, confidence))
            return result[0]['id'] if result else None
        except Exception as e:
            logger.error(f"Failed to insert sentiment analysis: {e}")
            return None
    
    def insert_detected_event(self, article_id, company_id, event_type, event_summary, confidence):
        query = """
        INSERT INTO detected_events (article_id, company_id, event_type, event_summary, confidence)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
        """
        try:
            result = self.execute_query(query, (article_id, company_id, event_type, event_summary, confidence))
            return result[0]['id'] if result else None
        except Exception as e:
            logger.error(f"Failed to insert detected event: {e}")
            return None
    
    def mark_article_processed(self, article_id):
        query = "UPDATE news_articles SET is_processed = true WHERE id = %s"
        return self.execute_query(query, (article_id,))
    
    def get_unprocessed_articles(self):
        query = """
        SELECT na.*, ns.name as source_name 
        FROM news_articles na
        JOIN news_sources ns ON na.source_id = ns.id
        WHERE na.is_processed = false
        ORDER BY na.published_at DESC
        LIMIT 100
        """
        return self.execute_query(query)
    
    def update_source_fetch_time(self, source_id):
        query = "UPDATE news_sources SET last_fetched = CURRENT_TIMESTAMP WHERE id = %s"
        return self.execute_query(query, (source_id,))
    
    def get_recent_articles_by_company(self, company_id, hours=24):
        query = """
        SELECT na.*, cm.confidence_score as mention_confidence
        FROM news_articles na
        JOIN company_mentions cm ON na.id = cm.article_id
        WHERE cm.company_id = %s 
        AND na.published_at >= NOW() - INTERVAL '%s hours'
        ORDER BY na.published_at DESC
        """
        return self.execute_query(query, (company_id, hours))
    
    def get_sentiment_summary(self, company_id, hours=24):
        query = """
        SELECT 
            AVG(sa.sentiment_score) as avg_sentiment,
            COUNT(*) as article_count,
            COUNT(CASE WHEN sa.sentiment_label = 'positive' THEN 1 END) as positive_count,
            COUNT(CASE WHEN sa.sentiment_label = 'negative' THEN 1 END) as negative_count,
            COUNT(CASE WHEN sa.sentiment_label = 'neutral' THEN 1 END) as neutral_count
        FROM sentiment_analysis sa
        WHERE sa.company_id = %s 
        AND sa.analyzed_at >= NOW() - INTERVAL '%s hours'
        """
        return self.execute_query(query, (company_id, hours))
    
    def get_trending_events(self, hours=24):
        query = """
        SELECT 
            de.event_type,
            c.name as company_name,
            c.ticker,
            COUNT(*) as event_count,
            AVG(de.confidence) as avg_confidence
        FROM detected_events de
        JOIN companies c ON de.company_id = c.id
        WHERE de.detected_at >= NOW() - INTERVAL '%s hours'
        GROUP BY de.event_type, c.name, c.ticker
        HAVING COUNT(*) > 1
        ORDER BY event_count DESC, avg_confidence DESC
        LIMIT 20
        """
        return self.execute_query(query, (hours,))

# Global database instance
db = DatabaseManager()
