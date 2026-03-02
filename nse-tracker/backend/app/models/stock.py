"""
Stock model for storing and managing stock data.

This module defines the Stock and StockPrice models with SQLAlchemy ORM,
including stock information and historical price data.
"""

from sqlalchemy import Column, Integer, String, DateTime, Numeric, Boolean, Text, ForeignKey, Index, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.core.database import Base


class Stock(Base):
    """Stock information model."""

    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    sector = Column(String(100), nullable=True)
    industry = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    website = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    prices = relationship("StockPrice", back_populates="stock", cascade="all, delete-orphan")
    historical_data = relationship("HistoricalStockData", back_populates="stock", cascade="all, delete-orphan")
    watchlist_entries = relationship("Watchlist", back_populates="stock")
    portfolio_entries = relationship("Portfolio", back_populates="stock")

    def __repr__(self):
        return f"<Stock(symbol={self.symbol}, name={self.name})>"

    @property
    def latest_price(self) -> "StockPrice":
        """Get the latest stock price."""
        if self.prices:
            return max(self.prices, key=lambda p: p.timestamp)
        return None

    @property
    def current_price(self) -> float:
        """Get the current stock price."""
        latest = self.latest_price
        return latest.price if latest else 0.0

    @property
    def price_change(self) -> float:
        """Get the price change from previous close."""
        latest = self.latest_price
        if latest and latest.previous_close:
            return latest.price - latest.previous_close
        return 0.0

    @property
    def price_change_percent(self) -> float:
        """Get the price change percentage from previous close."""
        latest = self.latest_price
        if latest and latest.previous_close and latest.previous_close > 0:
            return ((latest.price - latest.previous_close) / latest.previous_close) * 100
        return 0.0

    def to_dict(self) -> dict:
        """Convert stock to dictionary."""
        latest = self.latest_price
        return {
            "id": self.id,
            "symbol": self.symbol,
            "name": self.name,
            "sector": self.sector,
            "industry": self.industry,
            "description": self.description,
            "website": self.website,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "current_price": self.current_price,
            "price_change": self.price_change,
            "price_change_percent": self.price_change_percent,
            "latest_price": latest.to_dict() if latest else None
        }


class StockPrice(Base):
    """Stock price history model."""

    __tablename__ = "stock_prices"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False, index=True)
    price = Column(Numeric(10, 2), nullable=False)
    open_price = Column(Numeric(10, 2), nullable=True)
    high_price = Column(Numeric(10, 2), nullable=True)
    low_price = Column(Numeric(10, 2), nullable=True)
    close_price = Column(Numeric(10, 2), nullable=True)
    previous_close = Column(Numeric(10, 2), nullable=True)
    volume = Column(Integer, nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    stock = relationship("Stock", back_populates="prices")

    def __repr__(self):
        return f"<StockPrice(stock_id={self.stock_id}, price={self.price}, timestamp={self.timestamp})>"

    @property
    def price_float(self) -> float:
        """Get price as float."""
        return float(self.price)

    @property
    def change_from_open(self) -> float:
        """Get change from opening price."""
        if self.open_price:
            return self.price_float - float(self.open_price)
        return 0.0

    @property
    def change_percent_from_open(self) -> float:
        """Get percentage change from opening price."""
        if self.open_price and float(self.open_price) > 0:
            return (self.change_from_open / float(self.open_price)) * 100
        return 0.0

    def to_dict(self) -> dict:
        """Convert stock price to dictionary."""
        return {
            "id": self.id,
            "stock_id": self.stock_id,
            "price": self.price_float,
            "open_price": float(self.open_price) if self.open_price else None,
            "high_price": float(self.high_price) if self.high_price else None,
            "low_price": float(self.low_price) if self.low_price else None,
            "close_price": float(self.close_price) if self.close_price else None,
            "previous_close": float(self.previous_close) if self.previous_close else None,
            "volume": self.volume,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "change_from_open": self.change_from_open,
            "change_percent_from_open": self.change_percent_from_open
        }


class HistoricalStockData(Base):
    """5-year historical stock data for knowledge base."""

    __tablename__ = "historical_stock_data"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False, index=True)
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    open_price = Column(Numeric(10, 2), nullable=True)
    high_price = Column(Numeric(10, 2), nullable=True)
    low_price = Column(Numeric(10, 2), nullable=True)
    close_price = Column(Numeric(10, 2), nullable=True)
    volume = Column(Integer, nullable=True)
    adjusted_close = Column(Numeric(10, 2), nullable=True)
    dividend_amount = Column(Numeric(8, 2), nullable=True)
    split_coefficient = Column(Numeric(8, 4), nullable=True)

    # Technical indicators
    sma_20 = Column(Numeric(10, 2), nullable=True)  # 20-day simple moving average
    sma_50 = Column(Numeric(10, 2), nullable=True)  # 50-day simple moving average
    rsi_14 = Column(Numeric(5, 2), nullable=True)   # 14-day RSI
    macd = Column(Numeric(10, 2), nullable=True)    # MACD
    macd_signal = Column(Numeric(10, 2), nullable=True)  # MACD signal line
    bollinger_upper = Column(Numeric(10, 2), nullable=True)  # Bollinger upper band
    bollinger_lower = Column(Numeric(10, 2), nullable=True)  # Bollinger lower band

    # Market context
    market_cap = Column(Numeric(15, 2), nullable=True)
    pe_ratio = Column(Numeric(8, 2), nullable=True)
    pb_ratio = Column(Numeric(8, 2), nullable=True)
    dividend_yield = Column(Numeric(5, 2), nullable=True)

    # Additional metadata
    data_source = Column(String(50), nullable=True)  # 'yahoo', 'nse', 'alpha_vantage', etc.
    quality_score = Column(Integer, nullable=True)  # Data quality indicator (1-10)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    stock = relationship("Stock", back_populates="historical_data")

    def __repr__(self):
        return f"<HistoricalStockData(stock_id={self.stock_id}, date={self.date}, close={self.close_price})>"

    def to_dict(self) -> dict:
        """Convert historical data to dictionary."""
        return {
            "id": self.id,
            "stock_id": self.stock_id,
            "symbol": self.stock.symbol if self.stock else None,
            "date": self.date.isoformat() if self.date else None,
            "open_price": float(self.open_price) if self.open_price else None,
            "high_price": float(self.high_price) if self.high_price else None,
            "low_price": float(self.low_price) if self.low_price else None,
            "close_price": float(self.close_price) if self.close_price else None,
            "volume": self.volume,
            "adjusted_close": float(self.adjusted_close) if self.adjusted_close else None,
            "dividend_amount": float(self.dividend_amount) if self.dividend_amount else None,
            "split_coefficient": float(self.split_coefficient) if self.split_coefficient else None,
            "sma_20": float(self.sma_20) if self.sma_20 else None,
            "sma_50": float(self.sma_50) if self.sma_50 else None,
            "rsi_14": float(self.rsi_14) if self.rsi_14 else None,
            "macd": float(self.macd) if self.macd else None,
            "macd_signal": float(self.macd_signal) if self.macd_signal else None,
            "bollinger_upper": float(self.bollinger_upper) if self.bollinger_upper else None,
            "bollinger_lower": float(self.bollinger_lower) if self.bollinger_lower else None,
            "market_cap": float(self.market_cap) if self.market_cap else None,
            "pe_ratio": float(self.pe_ratio) if self.pe_ratio else None,
            "pb_ratio": float(self.pb_ratio) if self.pb_ratio else None,
            "dividend_yield": float(self.dividend_yield) if self.dividend_yield else None,
            "data_source": self.data_source,
            "quality_score": self.quality_score,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class MarketIndex(Base):
    """Market indices historical data."""

    __tablename__ = "market_indices"

    id = Column(Integer, primary_key=True, index=True)
    index_name = Column(String(100), nullable=False, index=True)  # 'NSE 20', 'NSE All Share', etc.
    index_code = Column(String(20), nullable=False, index=True)   # 'NSE20', 'NASI', etc.
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    value = Column(Numeric(12, 2), nullable=False)
    open_value = Column(Numeric(12, 2), nullable=True)
    high_value = Column(Numeric(12, 2), nullable=True)
    low_value = Column(Numeric(12, 2), nullable=True)
    close_value = Column(Numeric(12, 2), nullable=True)
    volume = Column(Integer, nullable=True)
    change_value = Column(Numeric(8, 2), nullable=True)
    change_percent = Column(Numeric(5, 2), nullable=True)

    # Market statistics
    total_market_cap = Column(Numeric(15, 2), nullable=True)
    total_volume = Column(Integer, nullable=True)
    advancers = Column(Integer, nullable=True)
    decliners = Column(Integer, nullable=True)
    unchanged = Column(Integer, nullable=True)

    data_source = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<MarketIndex(index={self.index_code}, date={self.date}, value={self.value})>"

    def to_dict(self) -> dict:
        """Convert market index to dictionary."""
        return {
            "id": self.id,
            "index_name": self.index_name,
            "index_code": self.index_code,
            "date": self.date.isoformat() if self.date else None,
            "value": float(self.value) if self.value else None,
            "open_value": float(self.open_value) if self.open_value else None,
            "high_value": float(self.high_value) if self.high_value else None,
            "low_value": float(self.low_value) if self.low_value else None,
            "close_value": float(self.close_value) if self.close_value else None,
            "volume": self.volume,
            "change_value": float(self.change_value) if self.change_value else None,
            "change_percent": float(self.change_percent) if self.change_percent else None,
            "total_market_cap": float(self.total_market_cap) if self.total_market_cap else None,
            "total_volume": self.total_volume,
            "advancers": self.advancers,
            "decliners": self.decliners,
            "unchanged": self.unchanged,
            "data_source": self.data_source,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class EconomicIndicator(Base):
    """Economic indicators and macroeconomic data."""

    __tablename__ = "economic_indicators"

    id = Column(Integer, primary_key=True, index=True)
    indicator_name = Column(String(200), nullable=False, index=True)
    indicator_code = Column(String(50), nullable=False, index=True)
    country = Column(String(100), nullable=True, default="Kenya")
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    value = Column(Numeric(15, 6), nullable=False)
    unit = Column(String(50), nullable=True)  # 'percentage', 'currency', 'index', etc.
    frequency = Column(String(20), nullable=True)  # 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'

    # Additional metadata
    source = Column(String(100), nullable=True)  # 'CBK', 'KNBS', 'IMF', etc.
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)  # 'inflation', 'gdp', 'interest_rates', etc.

    data_quality = Column(Integer, nullable=True)  # 1-10 scale
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<EconomicIndicator(code={self.indicator_code}, date={self.date}, value={self.value})>"

    def to_dict(self) -> dict:
        """Convert economic indicator to dictionary."""
        return {
            "id": self.id,
            "indicator_name": self.indicator_name,
            "indicator_code": self.indicator_code,
            "country": self.country,
            "date": self.date.isoformat() if self.date else None,
            "value": float(self.value) if self.value else None,
            "unit": self.unit,
            "frequency": self.frequency,
            "source": self.source,
            "description": self.description,
            "category": self.category,
            "data_quality": self.data_quality,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class HistoricalNewsEvent(Base):
    """Historical news events that impacted markets."""

    __tablename__ = "historical_news_events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    summary = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    url = Column(String(1000), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=False, index=True)

    # Source information
    source_name = Column(String(200), nullable=True)
    source_url = Column(String(500), nullable=True)
    author = Column(String(200), nullable=True)

    # Impact analysis
    sentiment_score = Column(Numeric(3, 2), nullable=True)  # -1 to 1
    sentiment_magnitude = Column(Numeric(3, 2), nullable=True)  # 0 to 1
    sentiment_label = Column(String(20), nullable=True)  # 'positive', 'negative', 'neutral'

    # Market impact
    affected_stocks = Column(JSONB, nullable=True)  # List of affected stock symbols
    market_impact_score = Column(Numeric(3, 2), nullable=True)  # Impact magnitude
    impact_description = Column(Text, nullable=True)

    # Event classification
    event_type = Column(String(100), nullable=True)  # 'earnings', 'merger', 'regulation', etc.
    event_category = Column(String(100), nullable=True)  # 'corporate', 'economic', 'political', etc.
    keywords = Column(JSONB, nullable=True)  # Important keywords/tags

    # Metadata
    data_source = Column(String(50), nullable=True)
    language = Column(String(10), nullable=True, default="en")
    is_archived = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<HistoricalNewsEvent(title={self.title[:50]}..., date={self.published_at})>"

    def to_dict(self) -> dict:
        """Convert news event to dictionary."""
        return {
            "id": self.id,
            "title": self.title,
            "summary": self.summary,
            "content": self.content,
            "url": self.url,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "source_name": self.source_name,
            "source_url": self.source_url,
            "author": self.author,
            "sentiment_score": float(self.sentiment_score) if self.sentiment_score else None,
            "sentiment_magnitude": float(self.sentiment_magnitude) if self.sentiment_magnitude else None,
            "sentiment_label": self.sentiment_label,
            "affected_stocks": self.affected_stocks,
            "market_impact_score": float(self.market_impact_score) if self.market_impact_score else None,
            "impact_description": self.impact_description,
            "event_type": self.event_type,
            "event_category": self.event_category,
            "keywords": self.keywords,
            "data_source": self.data_source,
            "language": self.language,
            "is_archived": self.is_archived,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


# Create indexes
Index('idx_stock_prices_stock_timestamp', StockPrice.stock_id, StockPrice.timestamp)
Index('idx_stock_prices_timestamp', StockPrice.timestamp)
Index('idx_historical_stock_data_stock_date', HistoricalStockData.stock_id, HistoricalStockData.date)
Index('idx_historical_stock_data_date', HistoricalStockData.date)
Index('idx_market_indices_code_date', MarketIndex.index_code, MarketIndex.date)
Index('idx_economic_indicators_code_date', EconomicIndicator.indicator_code, EconomicIndicator.date)
Index('idx_historical_news_events_date', HistoricalNewsEvent.published_at)
Index('idx_historical_news_events_type', HistoricalNewsEvent.event_type)
