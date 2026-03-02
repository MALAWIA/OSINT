"""
Stock data fetching task for NSE tracker.

This module implements Celery tasks for fetching stock prices
and market data from various APIs and sources.
"""

import httpx
from typing import List, Dict, Any
from datetime import datetime, timedelta
import structlog

from celery import Task
from sqlalchemy.orm import Session

from app.tasks.celery_app import celery_app
from app.core.database import SessionLocal
from app.core.config import settings
from app.models.stock import Stock, StockPrice
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
def fetch_stock_prices_task(
    self,
    symbols: List[str] = None,
    force_refresh: bool = False
) -> Dict[str, Any]:
    """
    Fetch stock prices from NSE API.

    Args:
        symbols: List of stock symbols to fetch (None for all)
        force_refresh: Force refresh cache

    Returns:
        Dict with fetch results and statistics
    """

    logger.info(
        "Starting stock prices fetch task",
        symbols=symbols,
        force_refresh=force_refresh
    )

    results = {
        "total_stocks": 0,
        "updated_prices": 0,
        "new_stocks": 0,
        "errors": []
    }

    try:
        db = SessionLocal()
        cache = get_cache()

        # Get list of stocks to fetch
        if symbols:
            stocks = db.query(Stock).filter(Stock.symbol.in_(symbols)).all()
        else:
            stocks = db.query(Stock).filter(Stock.is_active == True).all()

        # Fetch prices for each stock
        for stock in stocks:
            try:
                price_data = fetch_nse_price_sync(stock.symbol)

                if price_data:
                    # Save price to database
                    price = StockPrice(
                        stock_id=stock.id,
                        price=price_data['price'],
                        volume=price_data.get('volume'),
                        change_percent=price_data.get('change_percent'),
                        market_cap=price_data.get('market_cap'),
                        pe_ratio=price_data.get('pe_ratio'),
                        dividend_yield=price_data.get('dividend_yield'),
                        timestamp=datetime.utcnow()
                    )

                    db.add(price)
                    results["updated_prices"] += 1

                    # Update stock info if available
                    if 'name' in price_data:
                        stock.name = price_data['name']
                    if 'sector' in price_data:
                        stock.sector = price_data['sector']

                    logger.info(
                        "Updated stock price",
                        symbol=stock.symbol,
                        price=price_data['price']
                    )
                else:
                    logger.warning("No price data found", symbol=stock.symbol)

            except Exception as e:
                error_msg = f"Failed to fetch {stock.symbol}: {str(e)}"
                logger.error(error_msg)
                results["errors"].append(error_msg)

        # Commit changes
        db.commit()

        # Clear cache
        cache.delete("stocks:prices")
        cache.delete("stocks:stats")

        results["total_stocks"] = len(stocks)

        logger.info(
            "Stock prices fetch task completed",
            total_stocks=results["total_stocks"],
            updated_prices=results["updated_prices"],
            errors=len(results["errors"])
        )

        return results

    except Exception as e:
        logger.error("Stock prices fetch task failed", error=str(e))
        raise
    finally:
        db.close()


def fetch_nse_price_sync(symbol: str) -> Dict[str, Any]:
    """Fetch stock price from NSE API (synchronous)."""

    try:
        # Use actual NSE Kenya API endpoints
        # Primary: NSE official API
        url = f"https://www.nse.co.ke/api/equity-stock/{symbol}"

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.nse.co.ke/',
            'Origin': 'https://www.nse.co.ke'
        }

        with httpx.Client(timeout=30, headers=headers) as client:
            response = client.get(url)
            response.raise_for_status()

            data = response.json()

            # Parse NSE response format
            return {
                'price': data.get('lastPrice', data.get('price')),
                'volume': data.get('volumeTraded', data.get('volume')),
                'change_percent': data.get('priceChange', data.get('changePercent')),
                'market_cap': data.get('marketCapitalization'),
                'pe_ratio': data.get('peRatio'),
                'dividend_yield': data.get('dividendYield'),
                'name': data.get('companyName', data.get('name')),
                'sector': data.get('sector')
            }

    except Exception as e:
        logger.error("NSE API fetch failed", symbol=symbol, error=str(e))
        # Fallback to alternative data source
        return fetch_fallback_price_sync(symbol)


def fetch_fallback_price_sync(symbol: str) -> Dict[str, Any]:
    """Fallback stock price fetching using Yahoo Finance API."""

    try:
        # Use Yahoo Finance API as fallback
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}.NS"

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
        }

        with httpx.Client(timeout=30, headers=headers) as client:
            response = client.get(url)
            response.raise_for_status()

            data = response.json()
            chart = data.get('chart', {})
            result = chart.get('result', [{}])[0]
            meta = result.get('meta', {})

            # Get latest price from quote data
            quotes = result.get('indicators', {}).get('quote', [{}])[0]
            prices = quotes.get('close', [])
            latest_price = prices[-1] if prices else None

            return {
                'price': latest_price or meta.get('regularMarketPrice'),
                'volume': meta.get('regularMarketVolume'),
                'change_percent': meta.get('regularMarketChangePercent'),
                'market_cap': meta.get('marketCap'),
                'pe_ratio': meta.get('trailingPE'),
                'dividend_yield': meta.get('dividendYield'),
                'name': meta.get('shortName', meta.get('longName')),
                'sector': None  # Yahoo doesn't provide sector in this endpoint
            }

    except Exception as e:
        logger.error("Fallback price fetch failed", symbol=symbol, error=str(e))
        return None


@celery_app.task(bind=True, base_class=BaseTask)
def update_stock_list_task(self) -> Dict[str, Any]:
    """Update the complete list of NSE stocks."""

    logger.info("Starting stock list update task")

    results = {
        "new_stocks": 0,
        "updated_stocks": 0,
        "errors": []
    }

    try:
        db = SessionLocal()
        cache = get_cache()

        # Fetch stock list from NSE
        stock_list = fetch_nse_stock_list_sync()

        for stock_data in stock_list:
            try:
                # Check if stock exists
                existing = db.query(Stock).filter(Stock.symbol == stock_data['symbol']).first()

                if existing:
                    # Update existing stock
                    existing.name = stock_data.get('name', existing.name)
                    existing.sector = stock_data.get('sector', existing.sector)
                    existing.is_active = True
                    results["updated_stocks"] += 1
                else:
                    # Create new stock
                    stock = Stock(
                        symbol=stock_data['symbol'],
                        name=stock_data.get('name'),
                        sector=stock_data.get('sector'),
                        is_active=True
                    )
                    db.add(stock)
                    results["new_stocks"] += 1

            except Exception as e:
                error_msg = f"Failed to process {stock_data['symbol']}: {str(e)}"
                logger.error(error_msg)
                results["errors"].append(error_msg)

        db.commit()

        # Clear cache
        cache.delete("stocks:list")
        cache.delete("stocks:stats")

        logger.info(
            "Stock list update completed",
            new_stocks=results["new_stocks"],
            updated_stocks=results["updated_stocks"],
            errors=len(results["errors"])
        )

        return results

    except Exception as e:
        logger.error("Stock list update failed", error=str(e))
        raise
    finally:
        db.close()


def fetch_nse_stock_list_sync() -> List[Dict[str, Any]]:
    """Fetch complete stock list from NSE."""

    try:
        # Use actual NSE Kenya API for stock listings
        url = "https://www.nse.co.ke/api/equity-stocks"

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.nse.co.ke/',
            'Origin': 'https://www.nse.co.ke'
        }

        with httpx.Client(timeout=60, headers=headers) as client:
            response = client.get(url)
            response.raise_for_status()

            data = response.json()

            stocks = []
            # Handle different possible response formats
            stock_data = data.get('stocks', data.get('data', data.get('equities', [])))

            for item in stock_data:
                stocks.append({
                    'symbol': item.get('symbol', item.get('code')),
                    'name': item.get('companyName', item.get('name')),
                    'sector': item.get('sector', item.get('industry'))
                })

            logger.info(f"Fetched {len(stocks)} stocks from NSE")
            return stocks

    except Exception as e:
        logger.error("NSE stock list fetch failed", error=str(e))
        # Fallback to pre-configured list or alternative source
        return fetch_fallback_stock_list_sync()


def fetch_fallback_stock_list_sync() -> List[Dict[str, Any]]:
    """Fallback stock list fetching using pre-configured major NSE stocks."""

    # Major NSE Kenya stocks as fallback
    fallback_stocks = [
        {'symbol': 'EQTY', 'name': 'Equity Group Holdings', 'sector': 'Banking'},
        {'symbol': 'SCBK', 'name': 'Standard Chartered Bank Kenya', 'sector': 'Banking'},
        {'symbol': 'KCB', 'name': 'Kenya Commercial Bank', 'sector': 'Banking'},
        {'symbol': 'DTK', 'name': 'Diamond Trust Bank Kenya', 'sector': 'Banking'},
        {'symbol': 'NBK', 'name': 'National Bank of Kenya', 'sector': 'Banking'},
        {'symbol': 'COOP', 'name': 'Co-operative Bank', 'sector': 'Banking'},
        {'symbol': 'ABSA', 'name': 'Absa Bank Kenya', 'sector': 'Banking'},
        {'symbol': 'LIMT', 'name': 'Limuru Tea', 'sector': 'Agriculture'},
        {'symbol': 'SASN', 'name': 'Sasini Tea', 'sector': 'Agriculture'},
        {'symbol': 'KAPC', 'name': 'Kapchorua Tea', 'sector': 'Agriculture'},
        {'symbol': 'WTK', 'name': 'Williamson Tea Kenya', 'sector': 'Agriculture'},
        {'symbol': 'BAMB', 'name': 'Bamburi Cement', 'sector': 'Construction'},
        {'symbol': 'ARM', 'name': 'ARM Cement', 'sector': 'Construction'},
        {'symbol': 'EABL', 'name': 'East African Breweries', 'sector': 'Beverages'},
        {'symbol': 'BAT', 'name': 'British American Tobacco', 'sector': 'Tobacco'},
        {'symbol': 'TOTL', 'name': 'Total Kenya', 'sector': 'Oil & Gas'},
        {'symbol': 'KENO', 'name': 'KenolKobil', 'sector': 'Oil & Gas'},
        {'symbol': 'NSE', 'name': 'NSE', 'sector': 'Index'}
    ]

    logger.info(f"Using fallback stock list with {len(fallback_stocks)} stocks")
    return fallback_stocks
