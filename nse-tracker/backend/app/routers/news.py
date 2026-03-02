"""
News router for news management and search.

This module provides endpoints for fetching, searching,
and managing news articles with sentiment analysis.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc

from app.core.database import get_db
from app.deps import get_cache, get_current_user
from app.models.news import News
from app.models.portfolio import SentimentAnalysis
from app.models.user import User
from app.schemas.news import (
    NewsResponse, NewsList, NewsSearch, NewsWithSentiment,
    NewsStats, NewsFetchRequest
)

router = APIRouter(prefix="/api/news", tags=["News"])


@router.get("/", response_model=NewsList)
async def get_news(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    source: Optional[str] = Query(None, description="Filter by source"),
    search: Optional[str] = Query(None, description="Search query"),
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> NewsList:
    """Get paginated news articles with optional search and filtering."""
    
    # Build cache key
    cache_key = f"news:{page}:{page_size}:{source}:{search}"
    
    # Try to get from cache
    cached_result = cache.get(cache_key)
    if cached_result:
        return NewsList.parse_raw(cached_result)
    
    # Build query
    query = db.query(News).filter(News.is_active == True)
    
    # Add search filter
    if search:
        search_filter = or_(
            News.search_vector.match(search),
            News.title.ilike(f"%{search}%"),
            News.content.ilike(f"%{search}%"),
            News.summary.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Add source filter
    if source:
        query = query.filter(News.source_name == source)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    news_items = query.order_by(desc(News.published_at)).offset(offset).limit(page_size).all()
    
    # Convert to response models
    news_responses = [NewsResponse.from_orm(item) for item in news_items]
    
    # Create response
    response = NewsList(
        items=news_responses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )
    
    # Cache result
    cache.set(cache_key, response.json(), ttl=settings.NEWS_CACHE_TTL)
    
    return response


@router.get("/{news_id}", response_model=NewsWithSentiment)
async def get_news_article(
    news_id: int,
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> NewsWithSentiment:
    """Get a specific news article with sentiment analysis."""
    
    # Try cache first
    cache_key = f"news:{news_id}"
    cached_result = cache.get(cache_key)
    if cached_result:
        return NewsWithSentiment.parse_raw(cached_result)
    
    # Get news article
    news_item = db.query(News).filter(News.id == news_id).first()
    if not news_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News article not found"
        )
    
    # Get sentiment analysis
    sentiment = db.query(SentimentAnalysis).filter(SentimentAnalysis.news_id == news_id).first()
    
    # Create response
    response = NewsWithSentiment(
        **NewsResponse.from_orm(news_item).dict(),
        sentiment=sentiment
    )
    
    # Cache result
    cache.set(cache_key, response.json(), ttl=settings.NEWS_CACHE_TTL)
    
    return response


@router.get("/sources", response_model=List[str])
async def get_news_sources(
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> List[str]:
    """Get list of available news sources."""
    
    cache_key = "news:sources"
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result.split(',')
    
    sources = db.query(News.source_name).distinct().all()
    source_list = [source[0] for source in sources]
    
    cache.set(cache_key, ','.join(source_list), ttl=settings.NEWS_CACHE_TTL)
    
    return source_list


@router.get("/stats", response_model=NewsStats)
async def get_news_stats(
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> NewsStats:
    """Get news statistics."""
    
    cache_key = "news:stats"
    cached_result = cache.get(cache_key)
    if cached_result:
        return NewsStats.parse_raw(cached_result)
    
    # Get basic stats
    total_articles = db.query(News).count()
    active_articles = db.query(News).filter(News.is_active == True).count()
    sources_count = db.query(News.source_name).distinct().count()
    
    # Get last updated time
    last_updated = db.query(func.max(News.fetched_at)).scalar() or datetime.utcnow()
    
    # Get sentiment distribution
    sentiment_query = db.query(
        SentimentAnalysis.sentiment_label,
        func.count(SentimentAnalysis.id).label('count')
    ).join(News).group_by(SentimentAnalysis.sentiment_label)
    
    sentiment_distribution = {label: count for label, count in sentiment_query.all()}
    
    # Calculate average sentiment
    avg_sentiment = db.query(func.avg(SentimentAnalysis.sentiment_score)).scalar()
    
    response = NewsStats(
        total_articles=total_articles,
        active_articles=active_articles,
        sources_count=sources_count,
        last_updated=last_updated,
        average_sentiment=avg_sentiment,
        sentiment_distribution=sentiment_distribution
    )
    
    cache.set(cache_key, response.json(), ttl=settings.NEWS_CACHE_TTL)
    
    return response


@router.post("/fetch", response_model=dict)
async def fetch_news(
    fetch_request: NewsFetchRequest,
    db: Session = Depends(get_db)
) -> dict:
    """Trigger news fetching task."""
    
    try:
        # Import here to avoid circular imports
        from app.tasks.fetch_news import fetch_news_task
        
        # Trigger Celery task
        task = fetch_news_task.delay(
            sources=fetch_request.sources,
            max_articles=fetch_request.max_articles,
            force_refresh=fetch_request.force_refresh
        )
        
        return {
            "message": "News fetching task started",
            "task_id": task.id,
            "status": "pending"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start news fetching: {str(e)}"
        )


@router.delete("/{news_id}", response_model=dict)
async def delete_news(
    news_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Delete a news article (admin only)."""
    
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    news_item = db.query(News).filter(News.id == news_id).first()
    if not news_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News article not found"
        )
    
    db.delete(news_item)
    db.commit()
    
    # Clear cache
    cache = get_cache()
    cache.delete(f"news:{news_id}")
    cache.delete("news:stats")
    
    return {"message": "News article deleted successfully"}


@router.post("/{news_id}/sentiment", response_model=dict)
async def analyze_sentiment(
    news_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Trigger sentiment analysis for a news article."""
    
    news_item = db.query(News).filter(News.id == news_id).first()
    if not news_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News article not found"
        )
    
    try:
        # Import here to avoid circular imports
        from app.tasks.sentiment_analysis import analyze_sentiment_task
        
        # Trigger Celery task
        task = analyze_sentiment_task.delay(news_id)
        
        return {
            "message": "Sentiment analysis task started",
            "task_id": task.id,
            "status": "pending"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start sentiment analysis: {str(e)}"
        )
