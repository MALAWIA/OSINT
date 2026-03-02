"""
Data cleanup and maintenance tasks.

This module implements Celery tasks for cleaning up old data,
removing duplicates, and maintaining database health.
"""

import structlog
from typing import Dict, Any
from datetime import datetime, timedelta

from celery import Task
from sqlalchemy.orm import Session

from app.tasks.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.news import News
from app.models.stock import StockPrice
from app.models.user import LoginAttempt
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
def cleanup_old_data_task(self) -> Dict[str, Any]:
    """
    Clean up old data from various tables.

    Returns:
        Dict with cleanup statistics
    """

    logger.info("Starting data cleanup task")

    results = {
        "old_news_deleted": 0,
        "old_prices_deleted": 0,
        "old_login_attempts_deleted": 0,
        "errors": []
    }

    try:
        db = SessionLocal()
        cache = get_cache()

        # Clean up news older than 90 days
        news_cutoff = datetime.utcnow() - timedelta(days=90)
        old_news = db.query(News).filter(
            News.published_at < news_cutoff,
            News.is_active == False  # Only delete inactive news
        ).delete()

        results["old_news_deleted"] = old_news

        # Clean up stock prices older than 365 days
        price_cutoff = datetime.utcnow() - timedelta(days=365)
        old_prices = db.query(StockPrice).filter(
            StockPrice.timestamp < price_cutoff
        ).delete()

        results["old_prices_deleted"] = old_prices

        # Clean up login attempts older than 30 days
        login_cutoff = datetime.utcnow() - timedelta(days=30)
        old_logins = db.query(LoginAttempt).filter(
            LoginAttempt.timestamp < login_cutoff
        ).delete()

        results["old_login_attempts_deleted"] = old_logins

        # Commit changes
        db.commit()

        # Clear all caches after cleanup
        cache.flushall()

        logger.info(
            "Data cleanup completed",
            old_news_deleted=old_news,
            old_prices_deleted=old_prices,
            old_login_attempts_deleted=old_logins
        )

        return results

    except Exception as e:
        logger.error("Data cleanup task failed", error=str(e))
        db.rollback()
        raise
    finally:
        db.close()


@celery_app.task(bind=True, base_class=BaseTask)
def remove_duplicate_news_task(self) -> Dict[str, Any]:
    """
    Remove duplicate news articles based on URL and title similarity.

    Returns:
        Dict with deduplication statistics
    """

    logger.info("Starting duplicate news removal task")

    results = {
        "duplicates_removed": 0,
        "articles_processed": 0,
        "errors": []
    }

    try:
        db = SessionLocal()
        cache = get_cache()

        # Get all active news articles
        articles = db.query(News).filter(News.is_active == True).all()

        seen_urls = set()
        seen_titles = set()
        duplicates = []

        for article in articles:
            results["articles_processed"] += 1

            # Check for URL duplicates
            if article.url in seen_urls:
                duplicates.append(article.id)
                continue

            # Check for title duplicates (simple similarity check)
            title_lower = article.title.lower().strip()
            if title_lower in seen_titles:
                duplicates.append(article.id)
                continue

            seen_urls.add(article.url)
            seen_titles.add(title_lower)

        # Remove duplicates (keep the first occurrence)
        if duplicates:
            db.query(News).filter(News.id.in_(duplicates)).update({
                "is_active": False
            })
            db.commit()
            results["duplicates_removed"] = len(duplicates)

        # Clear cache
        cache.delete("news:stats")
        cache.delete("news:list")

        logger.info(
            "Duplicate removal completed",
            duplicates_removed=results["duplicates_removed"],
            articles_processed=results["articles_processed"]
        )

        return results

    except Exception as e:
        logger.error("Duplicate removal task failed", error=str(e))
        db.rollback()
        raise
    finally:
        db.close()


@celery_app.task(bind=True, base_class=BaseTask)
def optimize_database_task(self) -> Dict[str, Any]:
    """
    Perform database optimization tasks.

    Returns:
        Dict with optimization results
    """

    logger.info("Starting database optimization task")

    results = {
        "vacuum_completed": False,
        "indexes_rebuilt": False,
        "stats_updated": False,
        "errors": []
    }

    try:
        db = SessionLocal()

        # Note: These are PostgreSQL specific optimizations
        # For other databases, different commands would be needed

        try:
            # Analyze tables for query planning
            db.execute("ANALYZE")
            results["stats_updated"] = True

            # VACUUM to reclaim space (PostgreSQL)
            db.execute("VACUUM ANALYZE")
            results["vacuum_completed"] = True

            logger.info("Database optimization completed")

        except Exception as e:
            # Some databases might not support these commands
            logger.warning("Database optimization commands not supported", error=str(e))
            results["errors"].append("Database optimization commands not supported")

        db.commit()

        return results

    except Exception as e:
        logger.error("Database optimization task failed", error=str(e))
        raise
    finally:
        db.close()


@celery_app.task(bind=True, base_class=BaseTask)
def health_check_task(self) -> Dict[str, Any]:
    """
    Perform system health checks.

    Returns:
        Dict with health check results
    """

    logger.info("Starting health check task")

    results = {
        "database_healthy": False,
        "cache_healthy": False,
        "celery_healthy": True,  # If this task runs, Celery is healthy
        "errors": []
    }

    try:
        # Check database
        try:
            db = SessionLocal()
            db.execute("SELECT 1")
            results["database_healthy"] = True
            db.close()
        except Exception as e:
            results["errors"].append(f"Database check failed: {str(e)}")

        # Check cache
        try:
            cache = get_cache()
            cache.set("health_check", "ok", ttl=60)
            test_value = cache.get("health_check")
            results["cache_healthy"] = test_value == "ok"
        except Exception as e:
            results["errors"].append(f"Cache check failed: {str(e)}")

        logger.info(
            "Health check completed",
            database_healthy=results["database_healthy"],
            cache_healthy=results["cache_healthy"],
            errors=len(results["errors"])
        )

        return results

    except Exception as e:
        logger.error("Health check task failed", error=str(e))
        raise
