"""
Real-time data streaming service.

This module provides services for connecting to live NSE WebSocket feeds
and broadcasting real-time data updates to connected clients.
"""

import asyncio
import json
import websockets
import httpx
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import structlog

from app.core.websocket import (
    broadcast_stock_update,
    broadcast_news_alert,
    broadcast_market_sentiment,
    broadcast_market_summary
)
from app.core.config import settings

logger = structlog.get_logger()


class RealTimeDataService:
    """Service for real-time data streaming from NSE."""

    def __init__(self):
        # Use Finnhub WebSocket API for real-time stock data
        self.finnhub_ws_url = "wss://ws.finnhub.io"
        self.finnhub_api_key = getattr(settings, 'FINNHUB_API_KEY', None) or "demo"  # Use demo key for testing
        self.nse_ws_url = "wss://websocket.nse.co.ke/live"  # Fallback NSE WebSocket
        self.running = False
        self.last_market_summary = None

    async def start(self):
        """Start the real-time data service."""
        self.running = True
        logger.info("Starting real-time data service")

        # Start multiple tasks
        tasks = [
            self._connect_finnhub_websocket(),
            self._connect_nse_websocket(),  # Keep as fallback
            self._enhanced_polling_fallback(),
            self._market_summary_updater()
        ]

        await asyncio.gather(*tasks, return_exceptions=True)

    async def stop(self):
        """Stop the real-time data service."""
        self.running = False
        logger.info("Stopping real-time data service")

    async def _connect_finnhub_websocket(self):
        """Connect to Finnhub WebSocket for real-time stock data."""
        while self.running:
            try:
                logger.info("Connecting to Finnhub WebSocket")
                async with websockets.connect(f"{self.finnhub_ws_url}?token={self.finnhub_api_key}") as websocket:
                    logger.info("Connected to Finnhub WebSocket")

                    # Subscribe to major NSE stocks
                    subscribe_message = {
                        "type": "subscribe",
                        "symbol": "BINANCE:BTCUSDT"  # Example - replace with NSE symbols
                    }
                    await websocket.send(json.dumps(subscribe_message))

                    # Subscribe to specific NSE stocks (converted to international symbols where possible)
                    nse_symbols = ["EQTY.NS", "KCB.NS", "SCBK.NS"]  # NSE Kenya stocks in Yahoo format
                    for symbol in nse_symbols:
                        subscribe_msg = {"type": "subscribe", "symbol": symbol}
                        await websocket.send(json.dumps(subscribe_msg))

                    while self.running:
                        try:
                            message = await websocket.recv()
                            data = json.loads(message)

                            await self._process_finnhub_message(data)

                        except websockets.exceptions.ConnectionClosed:
                            logger.warning("Finnhub WebSocket connection closed")
                            break
                        except Exception as e:
                            logger.error("Error processing Finnhub WebSocket message", error=str(e))
                            continue

            except Exception as e:
                logger.error("Finnhub WebSocket connection failed", error=str(e))
                await asyncio.sleep(30)  # Retry after 30 seconds
        """Connect to NSE WebSocket for real-time data."""
        while self.running:
            try:
                logger.info("Connecting to NSE WebSocket")
                async with websockets.connect(
                    self.nse_ws_url,
                    extra_headers={
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                ) as websocket:
                    logger.info("Connected to NSE WebSocket")

                    # Subscribe to stock updates
                    subscribe_message = {
                        "type": "subscribe",
                        "symbols": ["*"],  # Subscribe to all stocks
                        "channels": ["price", "volume", "news"]
                    }
                    await websocket.send(json.dumps(subscribe_message))

                    while self.running:
                        try:
                            message = await websocket.recv()
                            data = json.loads(message)

                            await self._process_nse_message(data)

                        except websockets.exceptions.ConnectionClosed:
                            logger.warning("NSE WebSocket connection closed")
                            break
                        except Exception as e:
                            logger.error("Error processing NSE WebSocket message", error=str(e))
                            continue

            except Exception as e:
                logger.error("NSE WebSocket connection failed", error=str(e))
                await asyncio.sleep(30)  # Retry after 30 seconds

    async def _enhanced_polling_fallback(self):
        """Enhanced polling as fallback for real-time data."""
        logger.info("Starting enhanced polling fallback")

        while self.running:
            try:
                await self._poll_stock_updates()
                await self._poll_news_alerts()

                # Poll every 10 seconds for real-time feel
                await asyncio.sleep(10)

            except Exception as e:
                logger.error("Enhanced polling error", error=str(e))
                await asyncio.sleep(30)

    async def _market_summary_updater(self):
        """Update market summary periodically."""
        while self.running:
            try:
                await self._update_market_summary()
                await asyncio.sleep(60)  # Update every minute
            except Exception as e:
                logger.error("Market summary update error", error=str(e))
                await asyncio.sleep(60)

    async def _process_nse_message(self, data: Dict[str, Any]):
        """Process incoming NSE WebSocket message."""
        message_type = data.get("type")

        if message_type == "stock_update":
            symbol = data.get("symbol")
            price_data = {
                "price": data.get("price"),
                "change": data.get("change"),
                "change_percent": data.get("change_percent"),
                "volume": data.get("volume"),
                "timestamp": data.get("timestamp")
            }
            await broadcast_stock_update(symbol, price_data)

        elif message_type == "news_alert":
            news_data = {
                "title": data.get("title"),
                "summary": data.get("summary"),
                "source": data.get("source"),
                "url": data.get("url"),
                "sentiment": data.get("sentiment")
            }
            await broadcast_news_alert(news_data)

        elif message_type == "market_summary":
            summary_data = {
                "total_volume": data.get("total_volume"),
                "market_cap": data.get("market_cap"),
                "gainers": data.get("gainers", []),
                "losers": data.get("losers", []),
                "advancers": data.get("advancers"),
                "decliners": data.get("decliners")
            }
            await broadcast_market_summary(summary_data)
            self.last_market_summary = summary_data

    async def _process_finnhub_message(self, data: Dict[str, Any]):
        """Process incoming Finnhub WebSocket message."""
        try:
            if data.get("type") == "trade":
                # Process trade data
                trades = data.get("data", [])
                for trade in trades:
                    symbol = trade.get("s")  # symbol
                    price = trade.get("p")   # price
                    volume = trade.get("v")  # volume
                    timestamp = trade.get("t")  # timestamp

                    # Convert symbol format (remove exchange suffix for our internal format)
                    internal_symbol = symbol.replace(".NS", "") if ".NS" in symbol else symbol

                    price_data = {
                        "price": price,
                        "change": 0,  # Finnhub doesn't provide change in trade messages
                        "change_percent": 0,
                        "volume": volume,
                        "timestamp": timestamp / 1000  # Convert ms to seconds
                    }

                    await broadcast_stock_update(internal_symbol, price_data)

            elif data.get("type") == "ping":
                # Handle ping messages (Finnhub sends these)
                pass

        except Exception as e:
            logger.error("Error processing Finnhub message", error=str(e), data=data)

    async def _poll_stock_updates(self):
        """Poll for stock updates using real NSE API calls."""
        try:
            # Get list of active stocks to monitor from database
            from app.core.database import SessionLocal
            from app.models.stock import Stock

            db = SessionLocal()
            active_stocks = db.query(Stock).filter(Stock.is_active == True).limit(10).all()  # Limit to 10 for polling
            db.close()

            async with httpx.AsyncClient(timeout=10) as client:
                for stock in active_stocks:
                    try:
                        # Use real NSE API for each stock
                        url = f"https://www.nse.co.ke/api/equity-stock/{stock.symbol}"

                        headers = {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Accept': 'application/json, text/plain, */*',
                            'Referer': 'https://www.nse.co.ke/',
                            'Origin': 'https://www.nse.co.ke'
                        }

                        response = await client.get(url, headers=headers)
                        if response.status_code == 200:
                            data = response.json()

                            price_data = {
                                "price": data.get('lastPrice', data.get('price')),
                                "change": data.get('priceChange', 0),
                                "change_percent": data.get('changePercent', 0),
                                "volume": data.get('volumeTraded', data.get('volume', 0))
                            }

                            await broadcast_stock_update(stock.symbol, price_data)

                    except Exception as e:
                        logger.error("Failed to poll stock", symbol=stock.symbol, error=str(e))
                        continue

        except Exception as e:
            logger.error("Stock polling error", error=str(e))

    async def _poll_news_alerts(self):
        """Poll for new news alerts using real news APIs."""
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                # Use NewsAPI for real-time news alerts
                newsapi_key = settings.NEWSAPI_KEY or "demo"
                url = f"https://newsapi.org/v2/everything?q=NSE+OR+Nairobi+Stock+Exchange&sortBy=publishedAt&pageSize=5&apiKey={newsapi_key}"

                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    articles = data.get("articles", [])

                    for article in articles[:3]:  # Limit to 3 latest articles
                        news_data = {
                            "title": article.get("title", ""),
                            "summary": article.get("description", ""),
                            "source": article.get("source", {}).get("name", "NewsAPI"),
                            "url": article.get("url", ""),
                            "sentiment": 0  # Would be calculated by sentiment analysis task
                        }

                        if news_data["title"] and news_data["url"]:
                            await broadcast_news_alert(news_data)

        except Exception as e:
            logger.error("News polling error", error=str(e))

    async def _update_market_summary(self):
        """Update and broadcast market summary using real NSE data."""
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                # Use NSE market summary API
                url = "https://www.nse.co.ke/api/market-summary"

                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Referer': 'https://www.nse.co.ke/',
                    'Origin': 'https://www.nse.co.ke'
                }

                response = await client.get(url, headers=headers)
                if response.status_code == 200:
                    data = response.json()

                    # Transform NSE data format to our internal format
                    summary_data = {
                        "total_volume": data.get("totalVolume", 0),
                        "market_cap": data.get("totalMarketCap", 0),
                        "gainers": data.get("topGainers", []),
                        "losers": data.get("topLosers", []),
                        "advancers": data.get("advancers", 0),
                        "decliners": data.get("decliners", 0),
                        "nse_20_index": data.get("nse20Index", 0),
                        "nse_all_share_index": data.get("nseAllShareIndex", 0)
                    }

                    await broadcast_market_summary(summary_data)
                    self.last_market_summary = summary_data

        except Exception as e:
            logger.error("Market summary update error", error=str(e))


# Global service instance
realtime_service = RealTimeDataService()


async def start_realtime_service():
    """Start the real-time data service."""
    await realtime_service.start()


async def stop_realtime_service():
    """Stop the real-time data service."""
    await realtime_service.stop()


# Integration with FastAPI lifespan
async def lifespan_handler():
    """Handle service lifecycle."""
    # Start real-time service
    task = asyncio.create_task(start_realtime_service())

    yield

    # Stop real-time service
    await stop_realtime_service()
    task.cancel()

    try:
        await task
    except asyncio.CancelledError:
        pass
