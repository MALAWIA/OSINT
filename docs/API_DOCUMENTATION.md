# NSE Intelligence Platform API Documentation

## Overview

RESTful API for the NSE Intelligence & Communication Platform with WebSocket support for real-time features. The NSE-CT platform extends the existing OSINT foundation with specialized market tracking features for the Nairobi Stock Exchange.

## Base URL

```
http://localhost:3001/api
```

## Authentication

JWT-based authentication. Include token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "displayName": "John Doe",
  "role": "viewer"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "displayName": "John Doe",
    "role": "viewer",
    "isVerified": false,
    "createdAt": "2026-02-10T00:00:00Z"
  }
}
```

#### POST /auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "displayName": "John Doe",
    "role": "viewer",
    "isVerified": true
  }
}
```

#### POST /auth/refresh
Refresh JWT token.

#### POST /auth/logout
Logout user (invalidate token).

---

### Stock Prices

Real-time NSE ticker data, market overview, and historical prices.

#### GET /stock-prices/ticker
Get live ticker for all NSE-listed stocks.

**Response:**
```json
[
  {
    "companyId": "1",
    "ticker": "SCOM",
    "name": "Safaricom PLC",
    "sector": "Telecommunications",
    "currentPrice": 25.75,
    "previousClose": 25.50,
    "change": 0.25,
    "changePercent": 0.98,
    "volume": 15230000,
    "marketCap": 1025000000000,
    "lastUpdated": "2026-02-10T18:00:00Z"
  }
]
```

#### GET /stock-prices/overview
Get market overview with indices and summary statistics.

**Response:**
```json
{
  "indices": {
    "allShare": {
      "value": 168.45,
      "change": 3.2,
      "changePercent": 1.94
    },
    "nse20": {
      "value": 1845.67,
      "change": 12.34,
      "changePercent": 0.67
    }
  },
  "totalMarketCap": 2450000000000,
  "totalVolume": 85000000,
  "totalStocks": 65,
  "gainers": 28,
  "losers": 22,
  "unchanged": 15,
  "marketSentiment": "bullish",
  "tradingStatus": "open"
}
```

#### GET /stock-prices/heatmap
Get sector heatmap with performance metrics.

**Response:**
```json
[
  {
    "sector": "Technology",
    "stockCount": 4,
    "averageChange": 5.8,
    "totalMarketCap": 25000000000,
    "intensity": 5.8,
    "direction": "up"
  },
  {
    "sector": "Banking",
    "stockCount": 12,
    "averageChange": 0.5,
    "totalMarketCap": 850000000000,
    "intensity": 0.5,
    "direction": "up"
  }
]
```

#### GET /stock-prices/sectors
Get sector performance breakdown.

#### GET /stock-prices/gainers
Get top gaining stocks.

**Query Parameters:**
- `limit`: Number of results (default: 10)

#### GET /stock-prices/losers
Get top losing stocks.

**Query Parameters:**
- `limit`: Number of results (default: 10)

#### GET /stock-prices/active
Get most active stocks by volume.

**Query Parameters:**
- `limit`: Number of results (default: 10)

#### GET /stock-prices/symbol/:ticker
Get ticker details for a specific stock.

**Response:**
```json
{
  "companyId": "1",
  "ticker": "SCOM",
  "name": "Safaricom PLC",
  "sector": "Telecommunications",
  "currentPrice": 25.75,
  "previousClose": 25.50,
  "open": 25.55,
  "high": 26.10,
  "low": 25.40,
  "volume": 15230000,
  "change": 0.25,
  "changePercent": 0.98,
  "lastUpdated": "2026-02-10T18:00:00Z"
}
```

#### GET /stock-prices/symbol/:ticker/history
Get historical price data for a stock.

**Query Parameters:**
- `range`: Time range (1d, 5d, 1m, 3m, 6m, 1y, ytd, all)
- `interval`: Data interval (1min, 5min, 15min, 1h, 1d, 1w, 1M)

**Response:**
```json
{
  "ticker": "SCOM",
  "name": "Safaricom PLC",
  "range": "1m",
  "interval": "1d",
  "dataPoints": [
    {
      "date": "2026-01-10",
      "open": 24.50,
      "high": 25.00,
      "low": 24.30,
      "close": 24.80,
      "volume": 12000000
    }
  ]
}
```

#### GET /stock-prices/company/:companyId
Get stock price by company ID.

---

### Portfolio Management

Create and manage investment portfolios.

#### GET /portfolios
Get all portfolios for the authenticated user.

**Response:**
```json
[
  {
    "id": "p1",
    "name": "My NSE Portfolio",
    "description": "Primary portfolio tracking NSE blue-chip stocks",
    "isDefault": true,
    "isActive": true,
    "holdingsCount": 3,
    "summary": {
      "totalValue": 352500,
      "totalCost": 340000,
      "totalProfitLoss": 12500,
      "totalProfitLossPercent": 3.68
    },
    "createdAt": "2026-01-15T00:00:00Z"
  }
]
```

#### GET /portfolios/:id
Get portfolio details including holdings.

#### GET /portfolios/:id/performance
Get portfolio performance metrics.

**Response:**
```json
{
  "portfolioId": "p1",
  "portfolioName": "My NSE Portfolio",
  "totalCostBasis": 340000,
  "totalCurrentValue": 352500,
  "totalProfitLoss": 12500,
  "totalProfitLossPercent": 3.68,
  "holdingsCount": 3,
  "topPerformer": {
    "ticker": "SCOM",
    "profitLossPercent": 9.57
  },
  "worstPerformer": {
    "ticker": "EQTY",
    "profitLossPercent": -3.48
  },
  "sectorAllocation": [
    {
      "sector": "Telecommunications",
      "value": 128750,
      "percentage": 36.53
    },
    {
      "sector": "Banking",
      "value": 223750,
      "percentage": 63.47
    }
  ],
  "performanceTimeline": [
    { "date": "2026-01-10", "value": 340000 },
    { "date": "2026-01-11", "value": 342000 }
  ]
}
```

#### POST /portfolios
Create a new portfolio.

**Request Body:**
```json
{
  "name": "Tech Growth Portfolio",
  "description": "Focused on technology sector",
  "isDefault": false
}
```

#### PUT /portfolios/:id
Update portfolio details.

**Request Body:**
```json
{
  "name": "Updated Portfolio Name",
  "description": "Updated description",
  "isDefault": true
}
```

#### DELETE /portfolios/:id
Delete (deactivate) a portfolio.

#### POST /portfolios/:id/holdings
Add a holding to a portfolio.

**Request Body:**
```json
{
  "companyId": "1",
  "quantity": 1000,
  "averageBuyPrice": 24.50
}
```

**Response:**
```json
{
  "id": "h1",
  "companyId": "1",
  "companyName": "Safaricom PLC",
  "ticker": "SCOM",
  "quantity": 1000,
  "averageBuyPrice": 24.50,
  "currentPrice": 25.75,
  "totalValue": 25750,
  "profitLoss": 1250,
  "profitLossPercent": 5.10
}
```

#### PUT /portfolios/:id/holdings/:holdingId
Update holding quantity and average buy price.

**Request Body:**
```json
{
  "quantity": 1500,
  "averageBuyPrice": 24.00
}
```

#### DELETE /portfolios/:id/holdings/:holdingId
Remove a holding from portfolio.

---

### Price Alerts

Create and manage price alerts.

#### GET /alerts
Get all alerts for the authenticated user.

**Response:**
```json
[
  {
    "id": "a1",
    "companyId": "1",
    "companyName": "Safaricom PLC",
    "ticker": "SCOM",
    "alertType": "price_below",
    "targetValue": 24.00,
    "currentValue": 25.75,
    "status": "active",
    "notifyPush": true,
    "notifyEmail": false,
    "notifyInApp": true,
    "createdAt": "2026-02-01T00:00:00Z"
  }
]
```

#### GET /alerts/stats
Get alert statistics.

**Response:**
```json
{
  "total": 5,
  "active": 3,
  "triggered": 2,
  "expired": 0,
  "disabled": 0,
  "autoGenerated": 2,
  "manual": 3,
  "byType": {
    "priceAbove": 1,
    "priceBelow": 2,
    "percentChange": 1,
    "volumeSpike": 1,
    "newsMention": 0,
    "regulatoryUpdate": 0
  }
}
```

#### GET /alerts/triggered
Get all triggered alerts.

#### GET /alerts/:id
Get alert details.

#### POST /alerts
Create a new price alert.

**Request Body:**
```json
{
  "companyId": "1",
  "alertType": "price_below",
  "targetValue": 24.00,
  "message": "Alert me if Safaricom drops below KES 24",
  "notifyPush": true,
  "notifyEmail": true,
  "notifyInApp": true,
  "expiresAt": "2026-03-10T00:00:00Z"
}
```

**Alert Types:**
- `price_above`: Alert when price goes above target
- `price_below`: Alert when price goes below target
- `percent_change`: Alert on percentage movement
- `volume_spike`: Alert on unusual volume
- `news_mention`: Alert when company mentioned in news
- `regulatory_update`: Alert on regulatory announcements

#### PUT /alerts/:id
Update an alert.

#### PUT /alerts/:id/disable
Disable an alert.

#### DELETE /alerts/:id
Delete an alert.

---

### Companies

NSE-listed companies information.

#### GET /companies
Get all NSE-listed companies.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `sector`: Filter by sector
- `search`: Search by name, ticker, or description

**Response:**
```json
{
  "data": [
    {
      "id": "1",
      "ticker": "SCOM",
      "name": "Safaricom PLC",
      "sector": "Telecommunications",
      "description": "Leading telecommunications company",
      "website": "https://www.safaricom.co.ke",
      "stockPrice": 25.75,
      "marketCap": 1025000000000,
      "volume": 15230000,
      "changePercent": 0.98,
      "isActive": true,
      "hasRegulatoryFlag": false
    }
  ],
  "total": 65,
  "page": 1,
  "limit": 50,
  "totalPages": 2
}
```

#### GET /companies/sectors
Get list of sectors with company counts.

**Response:**
```json
[
  { "name": "Banking", "count": 12, "totalMarketCap": 850000000000 },
  { "name": "Telecommunications", "count": 2, "totalMarketCap": 1100000000000 },
  { "name": "Manufacturing", "count": 8, "totalMarketCap": 180000000000 }
]
```

#### GET /companies/gainers
Get top gaining stocks.

#### GET /companies/losers
Get top losing stocks.

#### GET /companies/active
Get most active stocks by volume.

#### GET /companies/stats
Get market statistics.

#### GET /companies/flagged
Get companies with regulatory flags.

#### GET /companies/:id
Get company details by ID.

#### GET /companies/symbol/:ticker
Get company details by ticker symbol.

---

### News

Financial news and sentiment analysis.

#### GET /news
Get all news articles.

**Query Parameters:**
- `limit`: Number of articles
- `offset`: Offset for pagination
- `companyId`: Filter by company
- `sentiment`: Filter by sentiment (positive/negative/neutral)
- `category`: Filter by category (market, corporate, earnings, regulatory)

**Response:**
```json
[
  {
    "id": "1",
    "title": "CMA Announces Revised Listing Requirements for FinTech Companies",
    "summary": "The Capital Markets Authority has announced revised listing requirements...",
    "source": "Capital Markets Authority",
    "sourceUrl": "https://www.cma.or.ke",
    "publishedAt": "2026-02-08T09:00:00Z",
    "sentiment": {
      "score": 0.75,
      "label": "positive",
      "confidence": 0.92
    },
    "companies": ["FTAF", "MPAY"],
    "keywords": ["CMA", "listing requirements", "fintech", "regulatory"],
    "category": "regulatory"
  }
]
```

#### GET /news/latest
Get latest news articles.

#### GET /news/stats
Get news statistics and sentiment distribution.

**Response:**
```json
{
  "totalArticles": 10,
  "sentimentDistribution": {
    "positive": 6,
    "negative": 1,
    "neutral": 3
  },
  "averageSentiment": 0.42,
  "overallSentiment": "positive",
  "categoryBreakdown": {
    "market": 3,
    "corporate": 4,
    "earnings": 2,
    "regulatory": 1
  }
}
```

#### GET /news/:id
Get news article details.

#### GET /news/company/:companyId
Get news for a specific company.

#### GET /news/keyword/:keyword
Get news by keyword.

#### GET /news/sentiment/:sentiment
Get news by sentiment label.

---

### Discussion Channels

#### GET /channels
Get available discussion channels.

#### GET /channels/:id
Get channel details.

#### POST /channels
Create a new channel.

#### GET /channels/:id/messages
Get messages from a channel.

#### POST /channels/:id/messages
Send a message to a channel.

**Request Body:**
```json
{
  "content": "Safaricom announced strong Q3 results!",
  "articleId": "uuid"
}
```

#### DELETE /messages/:id
Delete a message.

#### POST /channels/:id/join
Join a channel.

#### POST /channels/:id/leave
Leave a channel.

#### GET /channels/:id/stats
Get channel statistics.

---

### Moderation

#### GET /moderation/flag
Get moderation flags (admin/moderator only).

#### POST /moderation/flag
Create a moderation flag.

**Request Body:**
```json
{
  "targetType": "message",
  "targetId": "uuid",
  "reason": "inappropriate_content",
  "description": "Message contains financial advice"
}
```

#### GET /moderation/pending
Get pending moderation items (admin/moderator only).

#### PUT /moderation/review/:id
Review a moderation item.

#### GET /moderation/content
Get moderated content.

#### GET /moderation/stats
Get moderation statistics.

---

### Notifications

#### GET /notifications
Get user notifications.

#### GET /notifications/unread-count
Get unread notification count.

#### PUT /notifications/mark-read/:id
Mark notification as read.

#### PUT /notifications/mark-all-read
Mark all notifications as read.

#### DELETE /notifications/:id
Delete a notification.

---

### Analytics (Admin)

#### GET /analytics/overview
Get platform analytics overview.

#### GET /analytics/trending
Get trending topics and stocks.

#### GET /analytics/sentiment
Get sentiment analytics.

#### GET /analytics/users
Get user engagement analytics.

#### GET /analytics/health
Get system health metrics (admin only).

---

## WebSocket Events

### Connection

Connect to WebSocket server:

```javascript
const socket = io('http://localhost:3001/chat', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Events

#### Client to Server

**joinChannel**
```javascript
socket.emit('joinChannel', { channelId: 'uuid' });
```

**leaveChannel**
```javascript
socket.emit('leaveChannel', { channelId: 'uuid' });
```

**sendMessage**
```javascript
socket.emit('sendMessage', {
  channelId: 'uuid',
  content: 'Message content',
  articleId: 'uuid'
});
```

**typing**
```javascript
socket.emit('typing', {
  channelId: 'uuid',
  isTyping: true
});
```

**addReaction**
```javascript
socket.emit('addReaction', {
  messageId: 'uuid',
  reactionType: 'like'
});
```

#### Server to Client

**newMessage**
```javascript
socket.on('newMessage', (message) => {
  // Handle new message
});
```

**userJoined**
```javascript
socket.on('userJoined', (user) => {
  // Handle user joining channel
});
```

**userTyping**
```javascript
socket.on('userTyping', (data) => {
  // Handle user typing indicator
});
```

**messageFlagged**
```javascript
socket.on('messageFlagged', (data) => {
  // Handle flagged message (moderators)
});
```

**notification**
```javascript
socket.on('notification', (notification) => {
  // Handle real-time notification
});
```

---

## Error Handling

API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

Error response format:
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

---

## Rate Limiting

- **General API**: 100 requests per minute
- **Authentication**: 10 requests per minute
- **WebSocket**: 50 messages per minute

---

## User Roles

| Role | Description |
|------|-------------|
| `viewer` | View market data and news |
| `portfolio_manager` | Manage portfolios and alerts |
| `analyst` | Access analytics and research tools |
| `regulatory_officer` | Review regulatory feeds |
| `admin` | Full system access |
| `developer` | API access and integrations |

---

## Compliance Notice

This API provides access to public financial information analysis and does not offer investment advice. All data sources are publicly available and properly attributed in accordance with CMA regulations.
