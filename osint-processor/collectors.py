import requests
import feedparser
import hashlib
import time
import logging
from datetime import datetime, timezone
from bs4 import BeautifulSoup
from newspaper import Article
from urllib.parse import urljoin, urlparse
from database import db
from config import REQUEST_DELAY, MAX_RETRIES, CONTENT_HASH_ALGORITHM

logger = logging.getLogger(__name__)

class BaseCollector:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'NSE Intelligence Platform OSINT Collector 1.0'
        })
    
    def _make_request(self, url, retries=MAX_RETRIES):
        for attempt in range(retries):
            try:
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                return response
            except Exception as e:
                logger.warning(f"Request failed for {url} (attempt {attempt + 1}): {e}")
                if attempt < retries - 1:
                    time.sleep(REQUEST_DELAY * (attempt + 1))
                else:
                    logger.error(f"Failed to fetch {url} after {retries} attempts")
                    return None
        return None
    
    def _generate_content_hash(self, content):
        return hashlib.sha256(content.encode('utf-8')).hexdigest()
    
    def _clean_text(self, text):
        if not text:
            return ""
        # Remove extra whitespace and normalize
        return ' '.join(text.strip().split())

class RSSCollector(BaseCollector):
    def collect(self, source):
        logger.info(f"Collecting RSS from {source['name']}")
        
        if not source['rss_url']:
            logger.warning(f"No RSS URL for source {source['name']}")
            return
        
        try:
            feed = feedparser.parse(source['rss_url'])
            articles_collected = 0
            
            for entry in feed.entries:
                try:
                    # Extract basic info
                    title = self._clean_text(entry.title)
                    url = entry.link
                    published_at = None
                    
                    # Parse publication date
                    if hasattr(entry, 'published_parsed') and entry.published_parsed:
                        published_at = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                    elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                        published_at = datetime(*entry.updated_parsed[:6], tzinfo=timezone.utc)
                    
                    # Get content
                    content = ""
                    if hasattr(entry, 'content') and entry.content:
                        content = entry.content[0].value if entry.content[0].value else ""
                    elif hasattr(entry, 'summary'):
                        content = entry.summary
                    
                    # Clean HTML from content
                    if content:
                        soup = BeautifulSoup(content, 'html.parser')
                        content = self._clean_text(soup.get_text())
                    
                    # Generate hash for deduplication
                    content_hash = self._generate_content_hash(title + content[:500])
                    
                    # Insert into database
                    article_id = db.insert_news_article(
                        source['id'], title, url, content, published_at, content_hash
                    )
                    
                    if article_id:
                        articles_collected += 1
                        logger.debug(f"Inserted article: {title[:50]}...")
                    
                    # Rate limiting
                    time.sleep(REQUEST_DELAY)
                    
                except Exception as e:
                    logger.error(f"Error processing RSS entry: {e}")
                    continue
            
            logger.info(f"Collected {articles_collected} articles from {source['name']}")
            
            # Update source fetch time
            db.update_source_fetch_time(source['id'])
            
        except Exception as e:
            logger.error(f"Error collecting RSS from {source['name']}: {e}")

class WebScraper(BaseCollector):
    def collect(self, source):
        logger.info(f"Scraping website: {source['name']}")
        
        if not source['url']:
            logger.warning(f"No URL for source {source['name']}")
            return
        
        try:
            response = self._make_request(source['url'])
            if not response:
                return
            
            soup = BeautifulSoup(response.content, 'html.parser')
            articles_collected = 0
            
            # Find article links (this is source-specific, generic implementation)
            article_links = self._find_article_links(soup, source['url'])
            
            for link in article_links[:20]:  # Limit to prevent overloading
                try:
                    article_data = self._scrape_article(link)
                    if article_data:
                        content_hash = self._generate_content_hash(
                            article_data['title'] + article_data['content'][:500]
                        )
                        
                        article_id = db.insert_news_article(
                            source['id'], 
                            article_data['title'], 
                            article_data['url'], 
                            article_data['content'], 
                            article_data['published_at'], 
                            content_hash
                        )
                        
                        if article_id:
                            articles_collected += 1
                    
                    time.sleep(REQUEST_DELAY)
                    
                except Exception as e:
                    logger.error(f"Error scraping article {link}: {e}")
                    continue
            
            logger.info(f"Scraped {articles_collected} articles from {source['name']}")
            db.update_source_fetch_time(source['id'])
            
        except Exception as e:
            logger.error(f"Error scraping {source['name']}: {e}")
    
    def _find_article_links(self, soup, base_url):
        links = []
        
        # Common selectors for news articles
        selectors = [
            'a[href*="/article/"]',
            'a[href*="/news/"]',
            'a[href*="/story/"]',
            'h2 a',
            'h3 a',
            '.headline a',
            '.news-item a'
        ]
        
        for selector in selectors:
            try:
                elements = soup.select(selector)
                for element in elements:
                    href = element.get('href')
                    if href:
                        full_url = urljoin(base_url, href)
                        links.append(full_url)
            except Exception:
                continue
        
        # Remove duplicates and return
        return list(set(links))[:50]
    
    def _scrape_article(self, url):
        try:
            article = Article(url)
            article.download()
            article.parse()
            
            return {
                'title': self._clean_text(article.title),
                'url': url,
                'content': self._clean_text(article.text),
                'published_at': article.publish_date
            }
        except Exception as e:
            logger.error(f"Error scraping article {url}: {e}")
            return None

class APICollector(BaseCollector):
    def collect(self, source):
        logger.info(f"Collecting from API: {source['name']}")
        
        # This would be implemented based on specific API endpoints
        # For now, it's a placeholder for NSE or CMA APIs
        pass

class OSINTCollector:
    def __init__(self):
        self.collectors = {
            'rss': RSSCollector(),
            'scrape': WebScraper(),
            'api': APICollector()
        }
    
    def collect_all(self):
        logger.info("Starting OSINT collection cycle")
        
        sources = db.get_news_sources()
        total_articles = 0
        
        for source in sources:
            try:
                collector_type = source['source_type']
                if collector_type in self.collectors:
                    collector = self.collectors[collector_type]
                    collector.collect(source)
                else:
                    logger.warning(f"Unknown collector type: {collector_type}")
                
                time.sleep(REQUEST_DELAY)
                
            except Exception as e:
                logger.error(f"Error collecting from source {source['name']}: {e}")
                continue
        
        logger.info("OSINT collection cycle completed")

def run_collection():
    collector = OSINTCollector()
    collector.collect_all()
