"""
Sentiment analysis task for news articles.

This module implements Celery tasks for analyzing sentiment
of news articles using NLP techniques.
"""

import structlog
from typing import List, Dict, Any
from datetime import datetime, timedelta

from celery import Task
from sqlalchemy.orm import Session
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from app.tasks.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.news import News
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
def analyze_news_sentiment_task(
    self,
    hours_back: int = 24,
    batch_size: int = 100
) -> Dict[str, Any]:
    """
    Analyze sentiment for recent news articles.

    Args:
        hours_back: Analyze articles from the last N hours
        batch_size: Process articles in batches

    Returns:
        Dict with analysis results and statistics
    """

    logger.info(
        "Starting sentiment analysis task",
        hours_back=hours_back,
        batch_size=batch_size
    )

    results = {
        "articles_analyzed": 0,
        "sentiment_updated": 0,
        "average_sentiment": 0.0,
        "errors": []
    }

    try:
        db = SessionLocal()
        cache = get_cache()

        # Initialize sentiment analyzer
        analyzer = SentimentIntensityAnalyzer()

        # Get articles to analyze
        cutoff_time = datetime.utcnow() - timedelta(hours=hours_back)
        articles = db.query(News).filter(
            News.published_at >= cutoff_time,
            News.sentiment_score.is_(None)
        ).limit(batch_size).all()

        total_sentiment = 0.0

        for article in articles:
            try:
                # Combine title and content for analysis
                text = f"{article.title} {article.summary or ''} {article.content or ''}"

                if not text.strip():
                    continue

                # Analyze sentiment
                sentiment_scores = analyzer.polarity_scores(text)
                compound_score = sentiment_scores['compound']

                # Update article
                article.sentiment_score = compound_score
                article.sentiment_magnitude = abs(compound_score)
                article.sentiment_label = get_sentiment_label(compound_score)

                # Extract key topics (simplified - could use more advanced NLP)
                article.key_topics = extract_key_topics(text)

                total_sentiment += compound_score
                results["articles_analyzed"] += 1

                logger.debug(
                    "Analyzed article sentiment",
                    article_id=article.id,
                    sentiment_score=compound_score,
                    label=article.sentiment_label
                )

            except Exception as e:
                error_msg = f"Failed to analyze article {article.id}: {str(e)}"
                logger.error(error_msg)
                results["errors"].append(error_msg)

        # Commit changes
        if articles:
            db.commit()
            results["sentiment_updated"] = len(articles)

            if results["articles_analyzed"] > 0:
                results["average_sentiment"] = total_sentiment / results["articles_analyzed"]

        # Clear cache
        cache.delete("news:sentiment_stats")

        logger.info(
            "Sentiment analysis completed",
            articles_analyzed=results["articles_analyzed"],
            sentiment_updated=results["sentiment_updated"],
            average_sentiment=round(results["average_sentiment"], 3),
            errors=len(results["errors"])
        )

        return results

    except Exception as e:
        logger.error("Sentiment analysis task failed", error=str(e))
        raise
    finally:
        db.close()


def get_sentiment_label(score: float) -> str:
    """Convert sentiment score to label."""

    if score >= 0.05:
        return "positive"
    elif score <= -0.05:
        return "negative"
    else:
        return "neutral"


def extract_key_topics(text: str) -> str:
    """Extract key topics from text (simplified version)."""

    # Simple keyword extraction - could be enhanced with NLP libraries
    keywords = [
        'earnings', 'profit', 'loss', 'revenue', 'growth', 'decline',
        'merger', 'acquisition', 'dividend', 'ipo', 'market', 'trading',
        'shares', 'stock', 'price', 'volume', 'nse', 'exchange'
    ]

    found_topics = []
    text_lower = text.lower()

    for keyword in keywords:
        if keyword in text_lower:
            found_topics.append(keyword)

    return ','.join(found_topics[:5])  # Limit to top 5 topics


@celery_app.task(bind=True, base_class=BaseTask)
def update_market_sentiment_task(self) -> Dict[str, Any]:
    """
    Update overall market sentiment based on recent news.

    Returns:
        Dict with market sentiment summary
    """

    logger.info("Starting market sentiment update task")

    try:
        db = SessionLocal()
        cache = get_cache()

        # Get sentiment data for last 24 hours
        cutoff_time = datetime.utcnow() - timedelta(hours=24)

        sentiment_stats = db.query(
            News.sentiment_score,
            News.sentiment_label
        ).filter(
            News.published_at >= cutoff_time,
            News.sentiment_score.isnot(None)
        ).all()

        if not sentiment_stats:
            return {"status": "no_data", "message": "No sentiment data available"}

        # Calculate market sentiment
        total_articles = len(sentiment_stats)
        positive_count = sum(1 for s in sentiment_stats if s.sentiment_label == 'positive')
        negative_count = sum(1 for s in sentiment_stats if s.sentiment_label == 'negative')
        neutral_count = sum(1 for s in sentiment_stats if s.sentiment_label == 'neutral')

        avg_sentiment = sum(s.sentiment_score for s in sentiment_stats) / total_articles

        market_sentiment = {
            "timestamp": datetime.utcnow().isoformat(),
            "total_articles": total_articles,
            "positive_articles": positive_count,
            "negative_articles": negative_count,
            "neutral_articles": neutral_count,
            "average_sentiment": round(avg_sentiment, 3),
            "market_mood": get_market_mood(avg_sentiment, positive_count, negative_count, total_articles)
        }

        # Cache the result
        cache.set("market:sentiment", market_sentiment, ttl=3600)  # 1 hour cache

        logger.info(
            "Market sentiment updated",
            average_sentiment=round(avg_sentiment, 3),
            market_mood=market_sentiment["market_mood"],
            total_articles=total_articles
        )

        return market_sentiment

    except Exception as e:
        logger.error("Market sentiment update failed", error=str(e))
        raise
    finally:
        db.close()


def get_market_mood(avg_sentiment: float, positive: int, negative: int, total: int) -> str:
    """Determine overall market mood."""

    sentiment_ratio = (positive - negative) / total if total > 0 else 0

    if avg_sentiment > 0.1 and sentiment_ratio > 0.1:
        return "bullish"
    elif avg_sentiment < -0.1 and sentiment_ratio < -0.1:
        return "bearish"
    elif abs(avg_sentiment) < 0.05 and abs(sentiment_ratio) < 0.05:
        return "neutral"
    else:
        return "mixed"
