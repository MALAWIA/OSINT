"""
Stocks router for stock management and price tracking.

This module provides endpoints for stock information,
price data, watchlist management, and portfolio tracking.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, desc

from app.core.database import get_db
from app.deps import get_cache, get_current_user
from app.models.stock import Stock, StockPrice
from app.models.portfolio import Watchlist, Portfolio
from app.models.user import User
from app.schemas.stock import (
    StockResponse, StockList, StockSearch, StockPriceResponse,
    WatchlistResponse, WatchlistCreate, WatchlistUpdate,
    PortfolioResponse, PortfolioCreate, PortfolioUpdate,
    StockQuote, MarketStats, StockAlert, SentimentAnalysis,
    SentimentHistory, StockAnalysisResponse
)

router = APIRouter(prefix="/api/stocks", tags=["Stocks"])


@router.get("/", response_model=StockList)
async def get_stocks(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    search: Optional[str] = Query(None, description="Search query"),
    sector: Optional[str] = Query(None, description="Filter by sector"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> StockList:
    """Get paginated list of stocks with optional search and filtering."""
    
    # Build cache key
    cache_key = f"stocks:{page}:{page_size}:{search}:{sector}:{industry}:{is_active}"
    
    # Try to get from cache
    cached_result = cache.get(cache_key)
    if cached_result:
        return StockList.parse_raw(cached_result)
    
    # Build query
    query = db.query(Stock)
    
    # Add search filter
    if search:
        search_filter = and_(
            Stock.symbol.ilike(f"%{search}%"),
            Stock.name.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Add filters
    if sector:
        query = query.filter(Stock.sector == sector)
    if industry:
        query = query.filter(Stock.industry == industry)
    if is_active is not None:
        query = query.filter(Stock.is_active == is_active)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    stocks = query.order_by(Stock.symbol).offset(offset).limit(page_size).all()
    
    # Convert to response models
    stock_responses = [StockResponse.from_orm(stock) for stock in stocks]
    
    # Create response
    response = StockList(
        items=stock_responses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size
    )
    
    # Cache result
    cache.set(cache_key, response.json(), ttl=1800)
    
    return response


@router.get("/{symbol}", response_model=StockResponse)
async def get_stock(
    symbol: str,
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> StockResponse:
    """Get specific stock information."""
    
    # Try cache first
    cache_key = f"stock:{symbol.upper()}"
    cached_result = cache.get(cache_key)
    if cached_result:
        return StockResponse.parse_raw(cached_result)
    
    # Get stock from database
    stock = db.query(Stock).filter(Stock.symbol == symbol.upper()).first()
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found"
        )
    
    response = StockResponse.from_orm(stock)
    
    # Cache result
    cache.set(cache_key, response.json(), ttl=1800)
    
    return response


@router.get("/{symbol}/price", response_model=StockPriceResponse)
async def get_stock_price(
    symbol: str,
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> StockPriceResponse:
    """Get latest stock price."""
    
    # Try cache first
    cache_key = f"stock:{symbol.upper()}:price"
    cached_result = cache.get(cache_key)
    if cached_result:
        return StockPriceResponse.parse_raw(cached_result)
    
    # Get stock
    stock = db.query(Stock).filter(Stock.symbol == symbol.upper()).first()
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found"
        )
    
    # Get latest price
    latest_price = stock.latest_price
    if not latest_price:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No price data available"
        )
    
    response = StockPriceResponse.from_orm(latest_price)
    
    # Cache result
    cache.set(cache_key, response.json(), ttl=1800)
    
    return response


@router.get("/{symbol}/history", response_model=List[StockPriceResponse])
async def get_stock_history(
    symbol: str,
    days: int = Query(30, ge=1, le=365, description="Number of days"),
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> List[StockPriceResponse]:
    """Get historical stock prices."""
    
    # Try cache first
    cache_key = f"stock:{symbol.upper()}:history:{days}"
    cached_result = cache.get(cache_key)
    if cached_result:
        return [StockPriceResponse.parse_raw(item) for item in cached_result]
    
    # Get stock
    stock = db.query(Stock).filter(Stock.symbol == symbol.upper()).first()
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found"
        )
    
    # Get historical prices
    from datetime import datetime, timedelta
    start_date = datetime.utcnow() - timedelta(days=days)
    
    prices = db.query(StockPrice).filter(
        and_(
            StockPrice.stock_id == stock.id,
            StockPrice.timestamp >= start_date
        )
    ).order_by(desc(StockPrice.timestamp)).all()
    
    response = [StockPriceResponse.from_orm(price) for price in prices]
    
    # Cache result
    cache.set(cache_key, [price.json() for price in response], ttl=settings.STOCK_CACHE_TTL)
    
    return response


@router.get("/sectors", response_model=List[str])
async def get_sectors(
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> List[str]:
    """Get list of available sectors."""
    
    cache_key = "stocks:sectors"
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result.split(',')
    
    sectors = db.query(Stock.sector).distinct().filter(Stock.sector.isnot(None)).all()
    sector_list = [sector[0] for sector in sectors]
    
    cache.set(cache_key, ','.join(sector_list), ttl=3600)  # 1 hour
    
    return sector_list


@router.get("/industries", response_model=List[str])
async def get_industries(
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> List[str]:
    """Get list of available industries."""
    
    cache_key = "stocks:industries"
    cached_result = cache.get(cache_key)
    if cached_result:
        return cached_result.split(',')
    
    industries = db.query(Stock.industry).distinct().filter(Stock.industry.isnot(None)).all()
    industry_list = [industry[0] for industry in industries]
    
    cache.set(cache_key, ','.join(industry_list), ttl=3600)  # 1 hour
    
    return industry_list


@router.get("/stats", response_model=MarketStats)
async def get_market_stats(
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> MarketStats:
    """Get market statistics."""
    
    cache_key = "stocks:stats"
    cached_result = cache.get(cache_key)
    if cached_result:
        return MarketStats.parse_raw(cached_result)
    
    # Get basic stats
    total_stocks = db.query(Stock).count()
    active_stocks = db.query(Stock).filter(Stock.is_active == True).count()
    
    # Get total volume (sum of latest prices' volume)
    total_volume = db.query(func.sum(StockPrice.volume)).join(StockPrice.stock).filter(
        Stock.is_active == True
    ).scalar() or 0
    
    # Get top gainers and losers
    latest_prices = db.query(StockPrice).join(StockPrice.stock).filter(
        Stock.is_active == True
    ).all()
    
    # Calculate changes
    stocks_with_changes = []
    for price in latest_prices:
        if price.previous_close:
            change_percent = ((price.price - price.previous_close) / price.previous_close) * 100
            stocks_with_changes.append({
                'symbol': price.stock.symbol,
                'name': price.stock.name,
                'price': float(price.price),
                'change': float(price.price - price.previous_close),
                'change_percent': change_percent,
                'timestamp': price.timestamp
            })
    
    # Sort by change percent
    top_gainers = sorted(
        [s for s in stocks_with_changes if s['change_percent'] > 0],
        key=lambda x: x['change_percent'],
        reverse=True
    )[:5]
    
    top_losers = sorted(
        [s for s in stocks_with_changes if s['change_percent'] < 0],
        key=lambda x: x['change_percent']
    )[:5]
    
    response = MarketStats(
        total_stocks=total_stocks,
        active_stocks=active_stocks,
        total_volume=total_volume,
        last_updated=datetime.utcnow(),
        top_gainers=[StockQuote(**g) for g in top_gainers],
        top_losers=[StockQuote(**l) for l in top_losers]
    )
    
    # Cache result
    cache.set(cache_key, response.json(), ttl=1800)
    
    return response


@router.post("/watchlist", response_model=WatchlistResponse)
async def add_to_watchlist(
    watchlist_data: WatchlistCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> WatchlistResponse:
    """Add stock to user's watchlist."""
    
    # Check if stock exists
    stock = db.query(Stock).filter(Stock.id == watchlist_data.stock_id).first()
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found"
        )
    
    # Check if already in watchlist
    existing = db.query(Watchlist).filter(
        and_(
            Watchlist.user_id == current_user.id,
            Watchlist.stock_id == watchlist_data.stock_id
        )
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stock already in watchlist"
        )
    
    # Add to watchlist
    watchlist = Watchlist(
        user_id=current_user.id,
        stock_id=watchlist_data.stock_id,
        notes=watchlist_data.notes,
        is_active=True
    )
    
    db.add(watchlist)
    db.commit()
    db.refresh(watchlist)
    
    return WatchlistResponse.from_orm(watchlist)


@router.get("/watchlist", response_model=List[WatchlistResponse])
async def get_watchlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> List[WatchlistResponse]:
    """Get user's watchlist."""
    
    cache_key = f"watchlist:{current_user.id}"
    cached_result = cache.get(cache_key)
    if cached_result:
        return [WatchlistResponse.parse_raw(item) for item in cached_result]
    
    watchlist_items = db.query(Watchlist).filter(
        and_(
            Watchlist.user_id == current_user.id,
            Watchlist.is_active == True
        )
    ).order_by(Watchlist.added_at.desc()).all()
    
    response = [WatchlistResponse.from_orm(item) for item in watchlist_items]
    
    # Cache result
    cache.set(cache_key, [item.json() for item in response], ttl=settings.STOCK_CACHE_TTL)
    
    return response


@router.delete("/watchlist/{stock_id}", response_model=dict)
async def remove_from_watchlist(
    stock_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """Remove stock from user's watchlist."""
    
    watchlist_item = db.query(Watchlist).filter(
        and_(
            Watchlist.user_id == current_user.id,
            Watchlist.stock_id == stock_id
        )
    ).first()
    
    if not watchlist_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist item not found"
        )
    
    db.delete(watchlist_item)
    db.commit()
    
    # Clear cache
    cache = get_cache()
    cache.delete(f"watchlist:{current_user.id}")
    
    return {"message": "Stock removed from watchlist"}


@router.get("/{symbol}/sentiment", response_model=SentimentAnalysis)
async def get_stock_sentiment(
    symbol: str,
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> SentimentAnalysis:
    """Get market sentiment analysis for a stock."""

    # Try cache first
    cache_key = f"sentiment:{symbol.upper()}"
    cached_result = cache.get(cache_key)
    if cached_result:
        return SentimentAnalysis.parse_raw(cached_result)

    # Get stock
    stock = db.query(Stock).filter(Stock.symbol == symbol.upper()).first()
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found"
        )

    # Real-time sentiment analysis based on actual news and social data
    from app.services.sentiment import analyze_stock_sentiment
    from app.models.news import NewsArticle
    
    # Get recent news articles for this stock
    recent_news = db.query(NewsArticle).filter(
        and_(
            NewsArticle.symbols.contains([symbol.upper()]),
            NewsArticle.published_at >= datetime.utcnow() - timedelta(days=7)
        )
    ).order_by(desc(NewsArticle.published_at)).limit(50).all()
    
    # Analyze sentiment from actual news content
    sentiment_data = analyze_stock_sentiment(recent_news, symbol.upper())
    
    # Get social media mentions (would integrate with Twitter API, etc.)
    social_mentions = 0  # Placeholder for social media integration
    total_mentions = len(recent_news) + social_mentions
    
    # Calculate sentiment distribution from news articles
    positive_count = sum(1 for article in recent_news if article.sentiment_score > 0.2)
    negative_count = sum(1 for article in recent_news if article.sentiment_score < -0.2)
    neutral_count = len(recent_news) - positive_count - negative_count
    
    # Extract key topics from news articles
    key_topics = []
    if recent_news:
        from collections import Counter
        all_keywords = []
        for article in recent_news:
            if article.keywords:
                all_keywords.extend(article.keywords[:3])  # Top 3 keywords per article
        
        # Get most common keywords
        keyword_counts = Counter(all_keywords)
        key_topics = [keyword for keyword, _ in keyword_counts.most_common(5)]
    
    # Generate sources from news articles
    sources = list(set(article.source for article in recent_news if article.source))[:6]
    if not sources:
        sources = ["NSE News", "Financial Reports"]

    response = SentimentAnalysis(
        symbol=symbol.upper(),
        overall_sentiment=sentiment_data.get('overall_sentiment', 'neutral'),
        sentiment_score=round(sentiment_data.get('sentiment_score', 0), 3),
        confidence=round(sentiment_data.get('confidence', 0.8), 3),
        news_analyzed=len(recent_news),
        social_mentions=social_mentions,
        positive_count=positive_count,
        negative_count=negative_count,
        neutral_count=neutral_count,
        key_topics=key_topics,
        last_updated=datetime.utcnow(),
        sources=sources
    )

    # Cache result for 30 minutes
    cache.set(cache_key, response.json(), ttl=1800)

    return response


@router.get("/{symbol}/sentiment/history", response_model=List[SentimentHistory])
async def get_sentiment_history(
    symbol: str,
    days: int = Query(7, ge=1, le=30, description="Number of days"),
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> List[SentimentHistory]:
    """Get historical sentiment analysis for a stock."""

    # Try cache first
    cache_key = f"sentiment:history:{symbol.upper()}:{days}"
    cached_result = cache.get(cache_key)
    if cached_result:
        return [SentimentHistory(**item) for item in cached_result]

    # Get stock
    stock = db.query(Stock).filter(Stock.symbol == symbol.upper()).first()
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found"
        )

    # Generate real historical sentiment data based on news articles over time
    from collections import defaultdict
    
    history = []
    sentiment_by_date = defaultdict(lambda: {'scores': [], 'news_count': 0})
    
    # Group news by date and calculate daily sentiment
    for article in recent_news:
        date_key = article.published_at.date()
        sentiment_by_date[date_key]['scores'].append(article.sentiment_score)
        sentiment_by_date[date_key]['news_count'] += 1
    
    # Create sentiment history for the requested days
    base_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    for i in range(days):
        date = (base_date - timedelta(days=i)).date()
        
        if date in sentiment_by_date:
            # Calculate average sentiment for the day
            scores = sentiment_by_date[date]['scores']
            avg_sentiment = sum(scores) / len(scores) if scores else 0
            news_count = sentiment_by_date[date]['news_count']
            confidence = min(0.95, 0.5 + (news_count / 10) * 0.3)  # Higher confidence with more news
        else:
            # No news data for this day
            avg_sentiment = 0
            news_count = 0
            confidence = 0.5
        
        history.append(SentimentHistory(
            date=datetime.combine(date, datetime.min.time()),
            sentiment_score=round(avg_sentiment, 3),
            confidence=round(confidence, 3),
            news_analyzed=news_count
        ))
    
    # Sort by date ascending
    history.sort(key=lambda x: x.date)

    # Cache result
    cache.set(cache_key, [item.dict() for item in history], ttl=3600)

    return history


@router.get("/{symbol}/analysis", response_model=StockAnalysisResponse)
async def get_stock_analysis(
    symbol: str,
    include_history: bool = Query(False, description="Include sentiment history"),
    db: Session = Depends(get_db),
    cache = Depends(get_cache)
) -> StockAnalysisResponse:
    """Get comprehensive stock analysis with sentiment."""

    # Get stock info
    stock = db.query(Stock).filter(Stock.symbol == symbol.upper()).first()
    if not stock:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock not found"
        )

    # Get sentiment analysis
    sentiment = await get_stock_sentiment(symbol, db, cache)

    # Get sentiment history if requested
    sentiment_history = []
    if include_history:
        sentiment_history = await get_sentiment_history(symbol, 7, db, cache)

    # Create response
    response = StockAnalysisResponse.from_orm(stock)
    response.sentiment = sentiment
    response.sentiment_history = sentiment_history

    return response
