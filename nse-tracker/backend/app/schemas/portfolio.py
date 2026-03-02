"""
Portfolio schemas for request/response validation.

This module defines Pydantic schemas for portfolio and watchlist operations
including portfolio management, performance tracking, and analytics.
"""

from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal


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
    stock: dict  # StockResponse
    
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
    last_updated: datetime


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
    stock: dict  # StockResponse
    
    class Config:
        from_attributes = True


class PortfolioPerformance(BaseModel):
    """Portfolio performance schema."""
    period: str  # daily, weekly, monthly, yearly
    start_value: float
    end_value: float
    return_amount: float
    return_percent: float
    benchmark_return: Optional[float] = None
    alpha: Optional[float] = None


class PortfolioAnalytics(BaseModel):
    """Portfolio analytics schema."""
    total_value: float
    total_cost: float
    total_pnl: float
    total_pnl_percent: float
    positions_count: int
    sector_allocation: dict
    top_holdings: List[PortfolioResponse]
    performance_history: List[PortfolioPerformance]
    risk_metrics: dict
    last_updated: datetime


class PortfolioTransaction(BaseModel):
    """Portfolio transaction schema."""
    stock_id: int
    transaction_type: str  # buy, sell
    quantity: int
    price: Decimal
    timestamp: datetime
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True


class PortfolioRebalance(BaseModel):
    """Portfolio rebalance schema."""
    target_allocations: dict  # sector: target_percentage
    min_trade_amount: float = Field(100.0, description="Minimum trade amount")
    max_positions: int = Field(20, description="Maximum number of positions")


class PortfolioRecommendation(BaseModel):
    """Portfolio recommendation schema."""
    action: str  # buy, sell, hold
    stock_id: int
    current_weight: float
    target_weight: float
    reason: str
    confidence: float  # 0 to 1


class PortfolioExport(BaseModel):
    """Portfolio export schema."""
    format: str = Field("csv", description="Export format")
    include_transactions: bool = Field(False, description="Include transaction history")
    date_from: Optional[datetime] = Field(None, description="Start date for export")
    date_to: Optional[datetime] = Field(None, description="End date for export")
