"""
News fetching task for OSINT data collection.

This module implements Celery tasks for fetching news from
multiple sources including Google News RSS, NewsAPI, and web scraping.
"""

import asyncio
import feedparser
import httpx
from bs4 import BeautifulSoup
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from urllib.parse import urljoin, urlparse
import hashlib
import structlog

from celery import Task
from sqlalchemy.orm import Session

from app.tasks.celery_app import celery_app
from app.core.database import SessionLocal
from app.core.config import settings
from app.models.news import News
from app.deps import get_cache

logger = structlog.get_logger()


class BaseTask(Task):
    """Base task with error handling and logging."""
    
    def on_success(self, retval, task_id, args, kwargs):
        """Handle task success."""
        logger.info(
            "Task completed successfully",
            task_id=task_id,
            task_name=self.name,
            result=retval
        )
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Handle task failure."""
        logger.error(
            "Task failed",
            task_id=task_id,
            task_name=self.name,
            error=str(exc),
            traceback=str(einfo)
        )


@celery_app.task(bind=True, base_class=BaseTask)
def fetch_news_task(
    self,
    sources: Optional[List[str]] = None,
    max_articles: int = 50,
    force_refresh: bool = False
) -> Dict[str, Any]:
    """
    Fetch news from multiple sources.
    
    Args:
        sources: List of specific sources to fetch (None for all)
        max_articles: Maximum articles to fetch per source
        force_refresh: Force refresh cache
        
    Returns:
        Dict with fetch results and statistics
    """
    
    logger.info(
        "Starting news fetch task",
        sources=sources,
        max_articles=max_articles,
        force_refresh=force_refresh
    )
    
    results = {
        "total_articles": 0,
        "new_articles": 0,
        "sources_processed": [],
        "errors": []
    }
    
    try:
        db = SessionLocal()
        cache = get_cache()
        
        # Define news sources
        news_sources = [
            {
                "name": "Google News",
                "url": f"https://news.google.com/rss/search?q={settings.GOOGLE_NEWS_QUERY}&hl=en&gl=KE&ceid=KE:en",
                "type": "rss"
            },
            {
                "name": "NewsAPI",
                "url": f"https://newsapi.org/v2/everything?q=Nairobi%20Stock%20Exchange&apiKey={settings.NEWSAPI_KEY}",
                "type": "api"
            },
            {
                "name": "Business Daily Africa",
                "url": "https://www.businessdailyafrica.com",
                "type": "scrape"
            },
            {
                "name": "The Standard",
                "url": "https://www.standardmedia.co.ke",
                "type": "scrape"
            },
            {
                "name": "Nation Africa",
                "url": "https://nation.africa",
                "type": "scrape"
            }
        ]
        
        # Filter sources if specified
        if sources:
            news_sources = [s for s in news_sources if s["name"] in sources]
        
        # Process each source
        for source in news_sources:
            try:
                if source["type"] == "rss":
                    articles = fetch_from_rss_sync(source, max_articles)
                elif source["type"] == "api":
                    articles = fetch_from_newsapi_sync(source, max_articles)
                elif source["type"] == "scrape":
                    articles = fetch_from_web_scrape_sync(source, max_articles)
                else:
                    logger.warning("Unknown source type", source=source["name"])
                    continue
                
                # Save articles to database
                new_count = save_articles_to_db(db, articles, source["name"], cache)
                
                results["total_articles"] += len(articles)
                results["new_articles"] += new_count
                results["sources_processed"].append(source["name"])
                
                logger.info(
                    "Processed news source",
                    source=source["name"],
                    articles_found=len(articles),
                    new_articles=new_count
                )
                
            except Exception as e:
                error_msg = f"Failed to fetch from {source['name']}: {str(e)}"
                logger.error(error_msg)
                results["errors"].append(error_msg)
        
        db.close()
        
        logger.info(
            "News fetch task completed",
            total_articles=results["total_articles"],
            new_articles=results["new_articles"],
            sources_processed=len(results["sources_processed"]),
            errors=len(results["errors"])
        )
        
        return results
        
    except Exception as e:
        logger.error("News fetch task failed", error=str(e))
        raise


def fetch_from_rss_sync(source: Dict[str, Any], max_articles: int) -> List[Dict[str, Any]]:
    """Fetch news from RSS feed (synchronous)."""
    
    try:
        with httpx.Client(timeout=30) as client:
            response = client.get(source["url"])
            response.raise_for_status()
            
            feed = feedparser.parse(response.content)
            articles = []
            
            for entry in feed.entries[:max_articles]:
                article = {
                    "title": entry.get("title", ""),
                    "url": entry.get("link", ""),
                    "summary": entry.get("summary", ""),
                    "content": entry.get("description", ""),
                    "source_name": source["name"],
                    "source_url": source["url"],
                    "author": entry.get("author", ""),
                    "published_at": parse_date(entry.get("published"))
                }
                
                if article["title"] and article["url"]:
                    articles.append(article)
            
            return articles
            
    except Exception as e:
        logger.error("RSS fetch failed", source=source["name"], error=str(e))
        return []


def fetch_from_newsapi_sync(source: Dict[str, Any], max_articles: int) -> List[Dict[str, Any]]:
    """Fetch news from NewsAPI (synchronous)."""
    
    if not settings.NEWSAPI_KEY:
        logger.warning("NewsAPI key not configured")
        return []
    
    try:
        with httpx.Client(timeout=30) as client:
            response = client.get(source["url"])
            response.raise_for_status()
            
            data = response.json()
            articles = []
            
            for article in data.get("articles", [])[:max_articles]:
                article_data = {
                    "title": article.get("title", ""),
                    "url": article.get("url", ""),
                    "summary": article.get("description", ""),
                    "content": article.get("content", ""),
                    "source_name": article.get("source", {}).get("name", source["name"]),
                    "source_url": article.get("source", {}).get("url", ""),
                    "author": article.get("author", ""),
                    "published_at": parse_date(article.get("publishedAt"))
                }
                
                if article_data["title"] and article_data["url"]:
                    articles.append(article_data)
            
            return articles
            
    except Exception as e:
        logger.error("NewsAPI fetch failed", source=source["name"], error=str(e))
        return []


def fetch_from_web_scrape_sync(source: Dict[str, Any], max_articles: int) -> List[Dict[str, Any]]:
    """Fetch news by web scraping (synchronous)."""
    
    try:
        with httpx.Client(timeout=30) as client:
            response = client.get(source["url"])
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            articles = []
            
            # Look for common news article selectors
            article_selectors = [
                'article h2 a',
                'h3 a',
                '.article-title a',
                '.news-title a',
                'a[href*="/article"]',
                'a[href*="/news"]'
            ]
            
            found_links = set()
            for selector in article_selectors:
                links = soup.select(selector)
                for link in links[:max_articles]:
                    href = link.get('href')
                    title = link.get_text().strip()
                    
                    if href and title and href not in found_links:
                        # Convert relative URLs to absolute
                        if href.startswith('/'):
                            href = urljoin(source["url"], href)
                        
                        article_data = {
                            "title": title,
                            "url": href,
                            "summary": "",
                            "content": "",
                            "source_name": source["name"],
                            "source_url": source["url"],
                            "author": "",
                            "published_at": datetime.utcnow()
                        }
                        
                        articles.append(article_data)
                        found_links.add(href)
            
            return articles
            
    except Exception as e:
        logger.error("Web scrape failed", source=source["name"], error=str(e))
        return []


def save_articles_to_db(db: Session, articles: List[Dict[str, Any]], source_name: str, cache) -> int:
    """Save articles to database, avoiding duplicates."""
    
    new_count = 0
    
    for article_data in articles:
        try:
            # Create URL hash for deduplication
            url_hash = hashlib.md5(article_data["url"].encode()).hexdigest()
            
            # Check if article already exists
            existing = db.query(News).filter(News.url == article_data["url"]).first()
            if existing:
                continue
            
            # Create new article
            article = News(
                title=article_data["title"],
                url=article_data["url"],
                summary=article_data["summary"],
                content=article_data["content"],
                source_name=source_name,
                source_url=article_data.get("source_url"),
                author=article_data.get("author"),
                published_at=article_data.get("published_at"),
                is_active=True
            )
            
            db.add(article)
            new_count += 1
            
        except Exception as e:
            logger.error(
                "Failed to save article",
                title=article_data.get("title"),
                error=str(e)
            )
    
    try:
        db.commit()
        
        # Clear cache
        cache.delete("news:stats")
        cache.delete("news:sources")
        
    except Exception as e:
        logger.error("Failed to commit articles", error=str(e))
        db.rollback()
    
    return new_count


def parse_date(date_str: Optional[str]) -> Optional[datetime]:
    """Parse various date formats."""
    
    if not date_str:
        return datetime.utcnow()
    
    # Common date formats to try
    date_formats = [
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%d %H:%M:%S",
        "%a, %d %b %Y %H:%M:%S %Z",
        "%Y-%m-%d",
    ]
    
    for fmt in date_formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    
    # If all formats fail, return current time
    return datetime.utcnow()
