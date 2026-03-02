"""
Stock schemas for request/response validation.

This module defines Pydantic schemas for stock-related operations
including stock information, prices, watchlist, and portfolio management.
"""

from typing import Optional, List
from pydantic import BaseModel, Field, validator
from datetime import datetime
from decimal import Decimal


class StockBase(BaseModel):
    """Base stock schema."""
    symbol: str = Field(..., min_length=1, max_length=10, description="Stock symbol")
    name: str = Field(..., min_length=1, max_length=200, description="Stock name")
    sector: Optional[str] = Field(None, max_length=100, description="Stock sector")
    industry: Optional[str] = Field(None, max_length=100, description="Stock industry")
    description: Optional[str] = Field(None, description="Stock description")
    website: Optional[str] = Field(None, description="Company website")
    
    @validator('symbol')
    def validate_symbol(cls, v):
        """Validate stock symbol format."""
        return v.upper()
    
    @validator('website')
    def validate_website(cls, v):
        """Validate website URL."""
        if v and not v.startswith(('http://', 'https://')):
            raise ValueError('Website must start with http:// or https://')
        return v


class StockCreate(StockBase):
    """Stock creation schema."""
    pass


class StockUpdate(BaseModel):
    """Stock update schema."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    sector: Optional[str] = Field(None, max_length=100)
    industry: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    website: Optional[str] = None
    is_active: Optional[bool] = None


class StockResponse(StockBase):
    """Stock response schema."""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    current_price: float
    price_change: float
    price_change_percent: float
    latest_price: Optional['StockPriceResponse'] = None
    
    class Config:
        from_attributes = True


class StockPriceBase(BaseModel):
    """Base stock price schema."""
    price: Decimal = Field(..., ge=0, description="Stock price")
    open_price: Optional[Decimal] = Field(None, ge=0, description="Opening price")
    high_price: Optional[Decimal] = Field(None, ge=0, description="High price")
    low_price: Optional[Decimal] = Field(None, ge=0, description="Low price")
    close_price: Optional[Decimal] = Field(None, ge=0, description="Closing price")
    previous_close: Optional[Decimal] = Field(None, ge=0, description="Previous close price")
    volume: Optional[int] = Field(None, ge=0, description="Trading volume")
    timestamp: datetime = Field(..., description="Price timestamp")


class StockPriceCreate(StockPriceBase):
    """Stock price creation schema."""
    stock_id: int = Field(..., description="Stock ID")


class StockPriceResponse(StockPriceBase):
    """Stock price response schema."""
    id: int
    stock_id: int
    created_at: datetime
    change_from_open: float
    change_percent_from_open: float
    
    class Config:
        from_attributes = True


class StockSearch(BaseModel):
    """Stock search schema."""
    query: Optional[str] = Field(None, description="Search query")
    sector: Optional[str] = Field(None, description="Filter by sector")
    industry: Optional[str] = Field(None, description="Filter by industry")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(20, ge=1, le=100, description="Page size")


class StockList(BaseModel):
    """Stock list response schema."""
    items: List[StockResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class WatchlistBase(BaseModel):
    """Base watchlist schema."""
    stock_id: int = Field(..., description="Stock ID")
    notes: Optional[str] = Field(None, description="Watchlist notes")


class WatchlistCreate(WatchlistBase):
    """Watchlist creation schema."""
    pass


class WatchlistUpdate(BaseModel):
    """Watchlist update schema."""
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class WatchlistResponse(WatchlistBase):
    """Watchlist response schema."""
    id: int
    user_id: int
    added_at: datetime
    is_active: bool
    stock: StockResponse
    
    class Config:
        from_attributes = True


class PortfolioBase(BaseModel):
    """Base portfolio schema."""
    stock_id: int = Field(..., description="Stock ID")
    quantity: int = Field(..., ge=0, description="Number of shares")
    average_price: Optional[Decimal] = Field(None, ge=0, description="Average purchase price")
    notes: Optional[str] = Field(None, description="Portfolio notes")


class PortfolioCreate(PortfolioBase):
    """Portfolio creation schema."""
    pass


class PortfolioUpdate(BaseModel):
    """Portfolio update schema."""
    quantity: Optional[int] = Field(None, ge=0)
    average_price: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class PortfolioResponse(PortfolioBase):
    """Portfolio response schema."""
    id: int
    user_id: int
    added_at: datetime
    is_active: bool
    total_cost: float
    current_value: float
    unrealized_pnl: float
    unrealized_pnl_percent: float
    stock: StockResponse
    
    class Config:
        from_attributes = True


class PortfolioSummary(BaseModel):
    """Portfolio summary schema."""
    total_value: float
    total_cost: float
    total_pnl: float
    total_pnl_percent: float
    positions_count: int
    best_performer: Optional[PortfolioResponse] = None
    worst_performer: Optional[PortfolioResponse] = None


class StockQuote(BaseModel):
    """Stock quote schema."""
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float
    volume: Optional[int] = None
    timestamp: datetime


class MarketStats(BaseModel):
    """Market statistics schema."""
    total_stocks: int
    active_stocks: int
    total_volume: int
    market_cap: Optional[float] = None
    last_updated: datetime
    top_gainers: List[StockQuote]
    top_losers: List[StockQuote]


class StockAlert(BaseModel):
    """Stock alert schema."""
    stock_id: int
    alert_type: str = Field(..., description="Alert type")
    threshold: float = Field(..., description="Alert threshold")
    is_active: bool = Field(True, description="Alert status")
    
    @validator('alert_type')
    def validate_alert_type(cls, v):
        """Validate alert type."""
        allowed_types = ['price_above', 'price_below', 'change_above', 'change_below']
        if v not in allowed_types:
            raise ValueError(f'Alert type must be one of: {allowed_types}')
        return v


class SentimentAnalysis(BaseModel):
    """Market sentiment analysis schema."""
    symbol: str = Field(..., description="Stock symbol")
    overall_sentiment: str = Field(..., description="Overall sentiment: positive, negative, neutral")
    sentiment_score: float = Field(..., ge=-1, le=1, description="Sentiment score from -1 (negative) to 1 (positive)")
    confidence: float = Field(..., ge=0, le=1, description="Analysis confidence score")
    news_analyzed: int = Field(..., description="Number of news articles analyzed")
    social_mentions: int = Field(..., description="Number of social media mentions")
    positive_count: int = Field(..., description="Number of positive mentions")
    negative_count: int = Field(..., description="Number of negative mentions")
    neutral_count: int = Field(..., description="Number of neutral mentions")
    key_topics: List[str] = Field(default_factory=list, description="Key topics mentioned")
    last_updated: datetime = Field(..., description="When analysis was last updated")
    sources: List[str] = Field(default_factory=list, description="Sources analyzed")


class SentimentHistory(BaseModel):
    """Historical sentiment analysis."""
    date: datetime
    sentiment_score: float
    confidence: float
    news_analyzed: int


class StockAnalysisResponse(StockResponse):
    """Stock response with sentiment analysis."""
    sentiment: Optional[SentimentAnalysis] = None
    sentiment_history: List[SentimentHistory] = Field(default_factory=list)


# Forward reference resolution
StockResponse.model_rebuild()
StockPriceResponse.model_rebuild()
