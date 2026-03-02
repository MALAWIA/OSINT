"""
News model for storing and managing news articles.

This module defines the News model with SQLAlchemy ORM,
including full-text search capabilities and news source tracking.
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Index
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import relationship

from app.core.database import Base


class News(Base):
    """News article model."""
    
    __tablename__ = "news"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    content = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    url = Column(String(1000), unique=True, nullable=False, index=True)
    source_name = Column(String(100), nullable=False, index=True)
    source_url = Column(String(500), nullable=True)
    author = Column(String(200), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=False, index=True)
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    # Full-text search vector
    search_vector = Column(TSVECTOR, nullable=True)
    
    # Relationships
    sentiment_analysis = relationship("SentimentAnalysis", back_populates="news", uselist=False)
    
    def __repr__(self):
        return f"<News(id={self.id}, title={self.title[:50]}..., source={self.source_name})>"
    
    @property
    def display_summary(self) -> str:
        """Get a display-friendly summary."""
        if self.summary:
            return self.summary
        elif self.content:
            # Return first 200 characters of content
            return self.content[:200] + "..." if len(self.content) > 200 else self.content
        else:
            return "No summary available"
    
    def to_dict(self) -> dict:
        """Convert news to dictionary."""
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "summary": self.summary,
            "url": self.url,
            "source_name": self.source_name,
            "source_url": self.source_url,
            "author": self.author,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "fetched_at": self.fetched_at.isoformat() if self.fetched_at else None,
            "is_active": self.is_active,
            "display_summary": self.display_summary
        }
    
    @classmethod
    def create_search_vector(cls):
        """Create search vector for full-text search."""
        return """
        UPDATE news 
        SET search_vector = to_tsvector('english', title || ' ' || COALESCE(content, '') || ' ' || COALESCE(summary, ''))
        """
    
    @classmethod
    def get_search_index(cls):
        """Create GIN index for search vector."""
        return Index(
            'idx_news_search_vector',
            cls.search_vector,
            postgresql_using='gin'
        )


# Create the search index
News.get_search_index()
