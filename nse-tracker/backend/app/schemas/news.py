"""
News schemas for request/response validation.

This module defines Pydantic schemas for news-related operations
including news articles, search, and sentiment analysis.
"""

from typing import Optional, List
from pydantic import BaseModel, Field, validator
from datetime import datetime


class NewsBase(BaseModel):
    """Base news schema."""
    title: str = Field(..., min_length=1, max_length=500, description="News title")
    content: Optional[str] = Field(None, description="News content")
    summary: Optional[str] = Field(None, description="News summary")
    url: str = Field(..., description="News URL")
    source_name: str = Field(..., min_length=1, max_length=100, description="Source name")
    source_url: Optional[str] = Field(None, description="Source URL")
    author: Optional[str] = Field(None, max_length=200, description="Author name")
    published_at: datetime = Field(..., description="Publication date")
    
    @validator('url')
    def validate_url(cls, v):
        """Validate URL format."""
        if not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        return v


class NewsCreate(NewsBase):
    """News creation schema."""
    pass


class NewsUpdate(BaseModel):
    """News update schema."""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    content: Optional[str] = None
    summary: Optional[str] = None
    is_active: Optional[bool] = None


class NewsResponse(NewsBase):
    """News response schema."""
    id: int
    fetched_at: datetime
    is_active: bool
    display_summary: str
    
    class Config:
        from_attributes = True


class NewsSearch(BaseModel):
    """News search schema."""
    query: Optional[str] = Field(None, description="Search query")
    source: Optional[str] = Field(None, description="Filter by source")
    author: Optional[str] = Field(None, description="Filter by author")
    date_from: Optional[datetime] = Field(None, description="Filter by date from")
    date_to: Optional[datetime] = Field(None, description="Filter by date to")
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(20, ge=1, le=100, description="Page size")
    
    @validator('page_size')
    def validate_page_size(cls, v):
        """Validate page size."""
        if v > 100:
            raise ValueError('Page size cannot exceed 100')
        return v


class NewsList(BaseModel):
    """News list response schema."""
    items: List[NewsResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class SentimentAnalysisBase(BaseModel):
    """Base sentiment analysis schema."""
    sentiment_score: float = Field(..., ge=-1, le=1, description="Sentiment score (-1 to 1)")
    sentiment_label: str = Field(..., description="Sentiment label")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score")
    
    @validator('sentiment_label')
    def validate_sentiment_label(cls, v):
        """Validate sentiment label."""
        allowed_labels = ['positive', 'negative', 'neutral']
        if v not in allowed_labels:
            raise ValueError(f'Sentiment label must be one of: {allowed_labels}')
        return v


class SentimentAnalysisCreate(SentimentAnalysisBase):
    """Sentiment analysis creation schema."""
    news_id: int = Field(..., description="News article ID")


class SentimentAnalysisResponse(SentimentAnalysisBase):
    """Sentiment analysis response schema."""
    id: int
    news_id: int
    analyzed_at: datetime
    
    class Config:
        from_attributes = True


class NewsWithSentiment(NewsResponse):
    """News with sentiment analysis schema."""
    sentiment: Optional[SentimentAnalysisResponse] = None


class NewsSource(BaseModel):
    """News source schema."""
    name: str = Field(..., description="Source name")
    url: str = Field(..., description="Source URL")
    is_active: bool = Field(True, description="Source status")
    last_fetched: Optional[datetime] = Field(None, description="Last fetch time")
    article_count: int = Field(0, description="Number of articles")


class NewsStats(BaseModel):
    """News statistics schema."""
    total_articles: int
    active_articles: int
    sources_count: int
    last_updated: datetime
    average_sentiment: Optional[float] = None
    sentiment_distribution: Optional[dict] = None


class NewsFetchRequest(BaseModel):
    """News fetch request schema."""
    sources: Optional[List[str]] = Field(None, description="Specific sources to fetch")
    max_articles: int = Field(50, ge=1, le=100, description="Maximum articles to fetch")
    force_refresh: bool = Field(False, description="Force refresh cache")
