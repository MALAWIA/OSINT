"""
WebSocket manager for real-time data streaming.

This module provides WebSocket connection management and broadcasting
capabilities for real-time stock prices, news, and market data.
"""

import asyncio
import json
from typing import Dict, List, Set
from datetime import datetime
import structlog

from fastapi import WebSocket
from starlette.websockets import WebSocketState

logger = structlog.get_logger()


class ConnectionManager:
    """Manages WebSocket connections and broadcasting."""

    def __init__(self):
        # Active connections by topic
        self.active_connections: Dict[str, Set[WebSocket]] = {
            "stocks": set(),
            "news": set(),
            "market": set(),
        }

    async def connect(self, websocket: WebSocket, topic: str = "stocks"):
        """Connect a WebSocket to a topic."""
        await websocket.accept()

        if topic not in self.active_connections:
            self.active_connections[topic] = set()

        self.active_connections[topic].add(websocket)

        logger.info(
            "WebSocket connected",
            topic=topic,
            total_connections=sum(len(conns) for conns in self.active_connections.values())
        )

    def disconnect(self, websocket: WebSocket, topic: str = "stocks"):
        """Disconnect a WebSocket from a topic."""
        if topic in self.active_connections:
            self.active_connections[topic].discard(websocket)

        logger.info(
            "WebSocket disconnected",
            topic=topic,
            remaining_connections=len(self.active_connections.get(topic, set()))
        )

    async def broadcast(self, message: dict, topic: str = "stocks"):
        """Broadcast message to all connections in a topic."""
        if topic not in self.active_connections:
            return

        # Prepare message with timestamp
        message_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "topic": topic,
            **message
        }

        message_json = json.dumps(message_data)

        # Send to all connections in the topic
        disconnected = set()
        for connection in self.active_connections[topic]:
            try:
                if connection.client_state == WebSocketState.CONNECTED:
                    await connection.send_text(message_json)
                else:
                    disconnected.add(connection)
            except Exception as e:
                logger.error("Failed to send message to WebSocket", error=str(e))
                disconnected.remove(connection)

        # Clean up disconnected connections
        for conn in disconnected:
            self.active_connections[topic].discard(conn)

        if disconnected:
            logger.info("Cleaned up disconnected WebSockets", count=len(disconnected))

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send a message to a specific WebSocket."""
        try:
            if websocket.client_state == WebSocketState.CONNECTED:
                message_data = {
                    "timestamp": datetime.utcnow().isoformat(),
                    **message
                }
                await websocket.send_text(json.dumps(message_data))
        except Exception as e:
            logger.error("Failed to send personal message", error=str(e))

    def get_connection_count(self, topic: str = None) -> int:
        """Get the number of active connections."""
        if topic:
            return len(self.active_connections.get(topic, set()))
        return sum(len(conns) for conns in self.active_connections.values())


# Global connection manager instance
manager = ConnectionManager()


async def broadcast_stock_update(symbol: str, price_data: dict):
    """Broadcast stock price update to all connected clients."""
    await manager.broadcast({
        "type": "stock_update",
        "symbol": symbol,
        "data": price_data
    }, "stocks")


async def broadcast_news_alert(news_item: dict):
    """Broadcast new news alert to all connected clients."""
    await manager.broadcast({
        "type": "news_alert",
        "data": news_item
    }, "news")


async def broadcast_market_sentiment(sentiment_data: dict):
    """Broadcast market sentiment update."""
    await manager.broadcast({
        "type": "market_sentiment",
        "data": sentiment_data
    }, "market")


async def broadcast_market_summary(summary_data: dict):
    """Broadcast market summary update."""
    await manager.broadcast({
        "type": "market_summary",
        "data": summary_data
    }, "market")
