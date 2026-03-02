"""
Historical data collection tasks for NSE knowledge base.

This module implements Celery tasks for collecting and processing
5 years of historical NSE data, market indices, and economic indicators.
"""

import asyncio
import httpx
from typing import List, Dict, Any
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import structlog
import pandas as pd
import yfinance as yf

from celery import Task
from sqlalchemy.orm import Session

from app.tasks.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.stock import HistoricalStockData, MarketIndex, EconomicIndicator, HistoricalNewsEvent, Stock
from app.core.config import settings

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
def collect_historical_stock_data_task(
    self,
    symbols: List[str] = None,
    years_back: int = 5,
    force_refresh: bool = False
) -> Dict[str, Any]:
    """
    Collect 5-year historical stock data for NSE stocks.

    Args:
        symbols: List of stock symbols to collect (None for all active)
        years_back: Number of years of historical data to collect
        force_refresh: Force refresh existing data

    Returns:
        Dict with collection statistics
    """

    logger.info(
        "Starting historical stock data collection",
        symbols=symbols,
        years_back=years_back,
        force_refresh=force_refresh
    )

    results = {
        "stocks_processed": 0,
        "data_points_collected": 0,
        "errors": []
    }

    try:
        db = SessionLocal()

        # Get stocks to process
        if symbols:
            stocks = db.query(Stock).filter(Stock.symbol.in_(symbols)).all()
        else:
            stocks = db.query(Stock).filter(Stock.is_active == True).all()

        end_date = datetime.now()
        start_date = end_date - relativedelta(years=years_back)

        for stock in stocks:
            try:
                # Collect data from Yahoo Finance (most reliable for historical data)
                data_points = collect_yahoo_historical_data(
                    stock.symbol, start_date, end_date, force_refresh
                )

                # Save to database
                saved_count = save_historical_data_to_db(db, stock.id, data_points, "yahoo")

                results["stocks_processed"] += 1
                results["data_points_collected"] += saved_count

                logger.info(
                    f"Collected historical data for {stock.symbol}",
                    data_points=saved_count
                )

            except Exception as e:
                error_msg = f"Failed to collect data for {stock.symbol}: {str(e)}"
                logger.error(error_msg)
                results["errors"].append(error_msg)

        db.commit()

        logger.info(
            "Historical stock data collection completed",
            stocks_processed=results["stocks_processed"],
            total_data_points=results["data_points_collected"],
            errors=len(results["errors"])
        )

        return results

    except Exception as e:
        logger.error("Historical stock data collection failed", error=str(e))
        raise
    finally:
        db.close()


def collect_yahoo_historical_data(
    symbol: str,
    start_date: datetime,
    end_date: datetime,
    force_refresh: bool = False
) -> List[Dict[str, Any]]:
    """Collect historical data from Yahoo Finance."""

    try:
        # Add .NS suffix for NSE stocks on Yahoo Finance
        yahoo_symbol = f"{symbol}.NS"

        # Download data
        data = yf.download(
            yahoo_symbol,
            start=start_date.strftime('%Y-%m-%d'),
            end=end_date.strftime('%Y-%m-%d'),
            progress=False
        )

        if data.empty:
            logger.warning(f"No data found for {yahoo_symbol}")
            return []

        # Convert to our format
        historical_data = []
        for date, row in data.iterrows():
            data_point = {
                "date": date.to_pydatetime(),
                "open_price": float(row['Open']) if not pd.isna(row['Open']) else None,
                "high_price": float(row['High']) if not pd.isna(row['High']) else None,
                "low_price": float(row['Low']) if not pd.isna(row['Low']) else None,
                "close_price": float(row['Close']) if not pd.isna(row['Close']) else None,
                "volume": int(row['Volume']) if not pd.isna(row['Volume']) else None,
                "adjusted_close": float(row['Adj Close']) if 'Adj Close' in row and not pd.isna(row['Adj Close']) else None,
            }
            historical_data.append(data_point)

        logger.info(f"Collected {len(historical_data)} data points for {yahoo_symbol}")
        return historical_data

    except Exception as e:
        logger.error(f"Failed to collect Yahoo data for {symbol}", error=str(e))
        return []


def save_historical_data_to_db(
    db: Session,
    stock_id: int,
    data_points: List[Dict[str, Any]],
    data_source: str
) -> int:
    """Save historical data points to database."""

    saved_count = 0

    for data_point in data_points:
        try:
            # Check if data point already exists
            existing = db.query(HistoricalStockData).filter(
                HistoricalStockData.stock_id == stock_id,
                HistoricalStockData.date == data_point["date"]
            ).first()

            if existing and not force_refresh:
                continue

            # Create or update data point
            historical_data = HistoricalStockData(
                stock_id=stock_id,
                date=data_point["date"],
                open_price=data_point.get("open_price"),
                high_price=data_point.get("high_price"),
                low_price=data_point.get("low_price"),
                close_price=data_point.get("close_price"),
                volume=data_point.get("volume"),
                adjusted_close=data_point.get("adjusted_close"),
                data_source=data_source,
                quality_score=8  # Yahoo Finance data is generally high quality
            )

            if existing:
                # Update existing record
                for key, value in data_point.items():
                    if hasattr(historical_data, key):
                        setattr(historical_data, key, value)
                historical_data.updated_at = datetime.utcnow()
            else:
                # Add new record
                db.add(historical_data)

            saved_count += 1

        except Exception as e:
            logger.error(f"Failed to save historical data point", error=str(e))
            continue

    return saved_count


@celery_app.task(bind=True, base_class=BaseTask)
def collect_market_indices_history_task(
    self,
    years_back: int = 5,
    force_refresh: bool = False
) -> Dict[str, Any]:
    """
    Collect historical data for NSE market indices.

    Returns:
        Dict with collection statistics
    """

    logger.info("Starting market indices historical data collection", years_back=years_back)

    results = {
        "indices_processed": 0,
        "data_points_collected": 0,
        "errors": []
    }

    try:
        db = SessionLocal()

        # NSE indices to collect
        indices = [
            {"code": "NSE20", "name": "NSE 20 Share Index"},
            {"code": "NASI", "name": "NSE All Share Index"},
            {"code": "^NSEI", "name": "Nifty 50 (India)", "yahoo_symbol": "^NSEI"}  # Use Indian Nifty as reference
        ]

        end_date = datetime.now()
        start_date = end_date - relativedelta(years=years_back)

        for index_info in indices:
            try:
                # Use Yahoo Finance for historical index data
                yahoo_symbol = index_info.get("yahoo_symbol", f"{index_info['code']}.NS")

                data_points = collect_yahoo_index_data(
                    yahoo_symbol, start_date, end_date
                )

                # Save to database
                saved_count = save_index_data_to_db(
                    db, index_info["code"], index_info["name"], data_points, "yahoo"
                )

                results["indices_processed"] += 1
                results["data_points_collected"] += saved_count

                logger.info(
                    f"Collected index data for {index_info['code']}",
                    data_points=saved_count
                )

            except Exception as e:
                error_msg = f"Failed to collect index data for {index_info['code']}: {str(e)}"
                logger.error(error_msg)
                results["errors"].append(error_msg)

        db.commit()

        logger.info(
            "Market indices historical data collection completed",
            indices_processed=results["indices_processed"],
            total_data_points=results["data_points_collected"],
            errors=len(results["errors"])
        )

        return results

    except Exception as e:
        logger.error("Market indices historical data collection failed", error=str(e))
        raise
    finally:
        db.close()


def collect_yahoo_index_data(
    symbol: str,
    start_date: datetime,
    end_date: datetime
) -> List[Dict[str, Any]]:
    """Collect historical index data from Yahoo Finance."""

    try:
        # Download index data
        data = yf.download(
            symbol,
            start=start_date.strftime('%Y-%m-%d'),
            end=end_date.strftime('%Y-%m-%d'),
            progress=False
        )

        if data.empty:
            logger.warning(f"No index data found for {symbol}")
            return []

        # Convert to our format
        index_data = []
        for date, row in data.iterrows():
            data_point = {
                "date": date.to_pydatetime(),
                "value": float(row['Close']) if not pd.isna(row['Close']) else None,
                "open_value": float(row['Open']) if not pd.isna(row['Open']) else None,
                "high_value": float(row['High']) if not pd.isna(row['High']) else None,
                "low_value": float(row['Low']) if not pd.isna(row['Low']) else None,
                "close_value": float(row['Close']) if not pd.isna(row['Close']) else None,
                "volume": int(row['Volume']) if not pd.isna(row['Volume']) else None,
            }
            index_data.append(data_point)

        logger.info(f"Collected {len(index_data)} index data points for {symbol}")
        return index_data

    except Exception as e:
        logger.error(f"Failed to collect index data for {symbol}", error=str(e))
        return []


def save_index_data_to_db(
    db: Session,
    index_code: str,
    index_name: str,
    data_points: List[Dict[str, Any]],
    data_source: str
) -> int:
    """Save index data points to database."""

    saved_count = 0

    for data_point in data_points:
        try:
            # Check if data point already exists
            existing = db.query(MarketIndex).filter(
                MarketIndex.index_code == index_code,
                MarketIndex.date == data_point["date"]
            ).first()

            if existing:
                continue

            # Calculate change values
            change_value = None
            change_percent = None
            if data_point.get("close_value") and data_point.get("open_value"):
                change_value = data_point["close_value"] - data_point["open_value"]
                if data_point["open_value"] != 0:
                    change_percent = (change_value / data_point["open_value"]) * 100

            # Create new data point
            index_data = MarketIndex(
                index_name=index_name,
                index_code=index_code,
                date=data_point["date"],
                value=data_point["value"],
                open_value=data_point.get("open_value"),
                high_value=data_point.get("high_value"),
                low_value=data_point.get("low_value"),
                close_value=data_point.get("close_value"),
                volume=data_point.get("volume"),
                change_value=change_value,
                change_percent=change_percent,
                data_source=data_source
            )

            db.add(index_data)
            saved_count += 1

        except Exception as e:
            logger.error(f"Failed to save index data point", error=str(e))
            continue

    return saved_count


@celery_app.task(bind=True, base_class=BaseTask)
def collect_economic_indicators_task(
    self,
    years_back: int = 5,
    force_refresh: bool = False
) -> Dict[str, Any]:
    """
    Collect historical economic indicators data.

    Returns:
        Dict with collection statistics
    """

    logger.info("Starting economic indicators data collection", years_back=years_back)

    results = {
        "indicators_collected": 0,
        "data_points_collected": 0,
        "errors": []
    }

    try:
        db = SessionLocal()

        # Key economic indicators for Kenya
        indicators = [
            {
                "code": "INFLATION",
                "name": "Inflation Rate (CPI)",
                "category": "inflation",
                "frequency": "monthly",
                "source": "KNBS"
            },
            {
                "code": "INTEREST_RATE",
                "name": "Central Bank Rate",
                "category": "interest_rates",
                "frequency": "monthly",
                "source": "CBK"
            },
            {
                "code": "EXCHANGE_RATE",
                "name": "USD/KES Exchange Rate",
                "category": "currency",
                "frequency": "daily",
                "source": "CBK"
            },
            {
                "code": "GDP_GROWTH",
                "name": "GDP Growth Rate",
                "category": "gdp",
                "frequency": "quarterly",
                "source": "KNBS"
            }
        ]

        # For now, we'll create sample data as real APIs may require subscriptions
        # In production, integrate with actual economic data APIs

        for indicator in indicators:
            try:
                # Generate sample historical data (replace with real API calls)
                data_points = generate_sample_economic_data(
                    indicator["code"], years_back, indicator["frequency"]
                )

                # Save to database
                saved_count = save_economic_data_to_db(db, indicator, data_points)

                results["indicators_collected"] += 1
                results["data_points_collected"] += saved_count

                logger.info(
                    f"Collected economic data for {indicator['code']}",
                    data_points=saved_count
                )

            except Exception as e:
                error_msg = f"Failed to collect economic data for {indicator['code']}: {str(e)}"
                logger.error(error_msg)
                results["errors"].append(error_msg)

        db.commit()

        logger.info(
            "Economic indicators data collection completed",
            indicators_collected=results["indicators_collected"],
            total_data_points=results["data_points_collected"],
            errors=len(results["errors"])
        )

        return results

    except Exception as e:
        logger.error("Economic indicators data collection failed", error=str(e))
        raise
    finally:
        db.close()


def generate_sample_economic_data(
    indicator_code: str,
    years_back: int,
    frequency: str
) -> List[Dict[str, Any]]:
    """Generate sample economic data (replace with real API calls)."""

    import random

    data_points = []
    end_date = datetime.now()

    if frequency == "daily":
        periods = years_back * 365
        delta = timedelta(days=1)
    elif frequency == "monthly":
        periods = years_back * 12
        delta = relativedelta(months=1)
    elif frequency == "quarterly":
        periods = years_back * 4
        delta = relativedelta(months=3)
    else:
        periods = years_back
        delta = relativedelta(years=1)

    current_date = end_date - relativedelta(years=years_back)

    for _ in range(periods):
        # Generate realistic sample values based on indicator
        if indicator_code == "INFLATION":
            value = random.uniform(3.0, 12.0)  # 3-12% inflation
        elif indicator_code == "INTEREST_RATE":
            value = random.uniform(5.0, 15.0)  # 5-15% interest rate
        elif indicator_code == "EXCHANGE_RATE":
            value = random.uniform(100.0, 130.0)  # 100-130 KES per USD
        elif indicator_code == "GDP_GROWTH":
            value = random.uniform(2.0, 8.0)  # 2-8% GDP growth
        else:
            value = random.uniform(0, 100)

        data_point = {
            "date": current_date,
            "value": value
        }

        data_points.append(data_point)
        current_date += delta

    return data_points


def save_economic_data_to_db(
    db: Session,
    indicator_info: Dict[str, Any],
    data_points: List[Dict[str, Any]]
) -> int:
    """Save economic indicator data points to database."""

    saved_count = 0

    for data_point in data_points:
        try:
            # Check if data point already exists
            existing = db.query(EconomicIndicator).filter(
                EconomicIndicator.indicator_code == indicator_info["code"],
                EconomicIndicator.date == data_point["date"]
            ).first()

            if existing:
                continue

            # Create new data point
            economic_data = EconomicIndicator(
                indicator_name=indicator_info["name"],
                indicator_code=indicator_info["code"],
                date=data_point["date"],
                value=data_point["value"],
                unit="percentage" if "RATE" in indicator_info["code"] or "INFLATION" in indicator_info["code"] else "currency",
                frequency=indicator_info["frequency"],
                source=indicator_info["source"],
                category=indicator_info["category"],
                data_quality=7  # Sample data quality
            )

            db.add(economic_data)
            saved_count += 1

        except Exception as e:
            logger.error(f"Failed to save economic data point", error=str(e))
            continue

    return saved_count


@celery_app.task(bind=True, base_class=BaseTask)
def collect_historical_news_events_task(
    self,
    years_back: int = 5,
    force_refresh: bool = False
) -> Dict[str, Any]:
    """
    Collect historical news events that impacted NSE markets.

    Returns:
        Dict with collection statistics
    """

    logger.info("Starting historical news events collection", years_back=years_back)

    results = {
        "events_collected": 0,
        "errors": []
    }

    try:
        db = SessionLocal()

        # Collect news from NewsAPI with NSE-related keywords
        newsapi_key = settings.NEWSAPI_KEY or "demo"
        end_date = datetime.now()
        start_date = end_date - relativedelta(years=years_back)

        # NewsAPI has limitations, so we'll collect in chunks
        current_date = start_date
        chunk_size = relativedelta(months=1)

        while current_date < end_date:
            try:
                chunk_end = min(current_date + chunk_size, end_date)

                events = asyncio.run(collect_newsapi_historical_events(
                    newsapi_key, current_date, chunk_end
                ))

                # Save to database
                saved_count = save_news_events_to_db(db, events)
                results["events_collected"] += saved_count

                current_date = chunk_end

            except Exception as e:
                error_msg = f"Failed to collect news chunk {current_date}: {str(e)}"
                logger.error(error_msg)
                results["errors"].append(error_msg)
                current_date += chunk_size

        db.commit()

        logger.info(
            "Historical news events collection completed",
            events_collected=results["events_collected"],
            errors=len(results["errors"])
        )

        return results

    except Exception as e:
        logger.error("Historical news events collection failed", error=str(e))
        raise
    finally:
        db.close()


async def collect_newsapi_historical_events(
    api_key: str,
    start_date: datetime,
    end_date: datetime
) -> List[Dict[str, Any]]:
    """Collect historical news events from NewsAPI."""

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            url = (
                f"https://newsapi.org/v2/everything?"
                f"q=NSE+OR+Nairobi+Stock+Exchange+OR+Kenya+economy&"
                f"from={start_date.strftime('%Y-%m-%d')}&"
                f"to={end_date.strftime('%Y-%m-%d')}&"
                f"sortBy=publishedAt&"
                f"pageSize=50&"
                f"apiKey={api_key}"
            )

            response = await client.get(url)
            if response.status_code != 200:
                logger.warning(f"NewsAPI request failed: {response.status_code}")
                return []

            data = response.json()
            articles = data.get("articles", [])

            # Convert to our format
            events = []
            for article in articles:
                event = {
                    "title": article.get("title", ""),
                    "summary": article.get("description", ""),
                    "content": article.get("content", ""),
                    "url": article.get("url", ""),
                    "published_at": article.get("publishedAt", ""),
                    "source_name": article.get("source", {}).get("name", "NewsAPI"),
                    "author": article.get("author", ""),
                    "event_type": classify_news_event(article.get("title", "") + " " + article.get("description", "")),
                    "event_category": "economic",
                    "data_source": "newsapi"
                }

                if event["title"] and event["url"]:
                    events.append(event)

            return events

    except Exception as e:
        logger.error("Failed to collect NewsAPI historical events", error=str(e))
        return []


def classify_news_event(text: str) -> str:
    """Classify news event type based on content."""

    text_lower = text.lower()

    if any(keyword in text_lower for keyword in ["earnings", "profit", "revenue", "quarterly"]):
        return "earnings"
    elif any(keyword in text_lower for keyword in ["merger", "acquisition", "takeover"]):
        return "merger"
    elif any(keyword in text_lower for keyword in ["dividend", "split", "bonus"]):
        return "corporate_action"
    elif any(keyword in text_lower for keyword in ["regulation", "policy", "government", "cbk"]):
        return "regulation"
    else:
        return "general"


def save_news_events_to_db(db: Session, events: List[Dict[str, Any]]) -> int:
    """Save news events to database."""

    saved_count = 0

    for event_data in events:
        try:
            # Check if event already exists
            existing = db.query(HistoricalNewsEvent).filter(
                HistoricalNewsEvent.url == event_data["url"]
            ).first()

            if existing:
                continue

            # Parse published date
            published_at = None
            if event_data.get("published_at"):
                try:
                    published_at = datetime.fromisoformat(event_data["published_at"].replace('Z', '+00:00'))
                except:
                    published_at = datetime.utcnow()

            # Create new event
            news_event = HistoricalNewsEvent(
                title=event_data["title"],
                summary=event_data.get("summary"),
                content=event_data.get("content"),
                url=event_data["url"],
                published_at=published_at or datetime.utcnow(),
                source_name=event_data.get("source_name"),
                author=event_data.get("author"),
                event_type=event_data.get("event_type"),
                event_category=event_data.get("event_category"),
                data_source=event_data.get("data_source", "unknown")
            )

            db.add(news_event)
            saved_count += 1

        except Exception as e:
            logger.error(f"Failed to save news event", error=str(e))
            continue

    return saved_count
