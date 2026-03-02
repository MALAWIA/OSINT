"""
Portfolio and Watchlist models for user stock tracking.

This module defines the Watchlist and Portfolio models with SQLAlchemy ORM,
including user relationships for tracking stocks.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, Numeric
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Watchlist(Base):
    """User watchlist model."""
    
    __tablename__ = "watchlist"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False, index=True)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="watchlist")
    stock = relationship("Stock", back_populates="watchlist_entries")
    
    def __repr__(self):
        return f"<Watchlist(user_id={self.user_id}, stock_id={self.stock_id})>"
    
    def to_dict(self) -> dict:
        """Convert watchlist entry to dictionary."""
        stock_dict = self.stock.to_dict() if self.stock else {}
        return {
            "id": self.id,
            "user_id": self.user_id,
            "stock_id": self.stock_id,
            "added_at": self.added_at.isoformat() if self.added_at else None,
            "notes": self.notes,
            "is_active": self.is_active,
            "stock": stock_dict
        }


class Portfolio(Base):
    """User portfolio model."""
    
    __tablename__ = "portfolio"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False, default=0)
    average_price = Column(Numeric(10, 2), nullable=True)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", back_populates="portfolio")
    stock = relationship("Stock", back_populates="portfolio_entries")
    
    def __repr__(self):
        return f"<Portfolio(user_id={self.user_id}, stock_id={self.stock_id}, quantity={self.quantity})>"
    
    @property
    def total_cost(self) -> float:
        """Get total cost of position."""
        if self.average_price and self.quantity:
            return float(self.average_price) * self.quantity
        return 0.0
    
    @property
    def current_value(self) -> float:
        """Get current value of position."""
        if self.stock and self.quantity:
            return self.stock.current_price * self.quantity
        return 0.0
    
    @property
    def unrealized_pnl(self) -> float:
        """Get unrealized profit/loss."""
        return self.current_value - self.total_cost
    
    @property
    def unrealized_pnl_percent(self) -> float:
        """Get unrealized profit/loss percentage."""
        if self.total_cost > 0:
            return (self.unrealized_pnl / self.total_cost) * 100
        return 0.0
    
    def to_dict(self) -> dict:
        """Convert portfolio entry to dictionary."""
        stock_dict = self.stock.to_dict() if self.stock else {}
        return {
            "id": self.id,
            "user_id": self.user_id,
            "stock_id": self.stock_id,
            "quantity": self.quantity,
            "average_price": float(self.average_price) if self.average_price else None,
            "added_at": self.added_at.isoformat() if self.added_at else None,
            "notes": self.notes,
            "is_active": self.is_active,
            "total_cost": self.total_cost,
            "current_value": self.current_value,
            "unrealized_pnl": self.unrealized_pnl,
            "unrealized_pnl_percent": self.unrealized_pnl_percent,
            "stock": stock_dict
        }


class SentimentAnalysis(Base):
    """Sentiment analysis model for news articles."""
    
    __tablename__ = "sentiment_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    news_id = Column(Integer, ForeignKey("news.id"), nullable=False, index=True, unique=True)
    sentiment_score = Column(Integer, nullable=False)  # -1 to 1 (negative to positive)
    sentiment_label = Column(String(20), nullable=False)  # positive, negative, neutral
    confidence = Column(Integer, nullable=False)  # 0 to 100
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    news = relationship("News", back_populates="sentiment_analysis")
    
    def __repr__(self):
        return f"<SentimentAnalysis(news_id={self.news_id}, sentiment={self.sentiment_label})>"
    
    def to_dict(self) -> dict:
        """Convert sentiment analysis to dictionary."""
        return {
            "id": self.id,
            "news_id": self.news_id,
            "sentiment_score": self.sentiment_score,
            "sentiment_label": self.sentiment_label,
            "confidence": self.confidence,
            "analyzed_at": self.analyzed_at.isoformat() if self.analyzed_at else None
        }
