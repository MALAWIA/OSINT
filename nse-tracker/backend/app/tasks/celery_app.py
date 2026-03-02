"""
Celery application configuration for background tasks.

This module sets up Celery with Redis broker and provides
task configuration for background processing.
"""

from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

# Create Celery app
celery_app = Celery(
    "nse_tracker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.fetch_news",
        "app.tasks.fetch_stocks",
        "app.tasks.sentiment_analysis",
        "app.tasks.historical_data"
    ]
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Configure periodic tasks
celery_app.conf.beat_schedule = {
    # Fetch news every 30 minutes
    'fetch-news-every-30-minutes': {
        'task': 'app.tasks.fetch_news.fetch_news_task',
        'schedule': crontab(minute='*/30'),  # Every 30 minutes
        'options': {'queue': 'news'}
    },
    
    # Fetch stock prices every 5 minutes
    'fetch-stocks-every-5-minutes': {
        'task': 'app.tasks.fetch_stocks.fetch_stock_prices_task',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
        'options': {'queue': 'stocks'}
    },
    
    # Analyze sentiment for new news every hour
    'analyze-sentiment-every-hour': {
        'task': 'app.tasks.sentiment_analysis.analyze_news_sentiment_task',
        'schedule': crontab(minute='0'),  # Every hour
        'options': {'queue': 'sentiment'}
    },
    
    # Clean up old data every day at 2 AM
    'cleanup-old-data-daily': {
        'task': 'app.tasks.cleanup.cleanup_old_data_task',
        'schedule': crontab(hour='2', minute='0'),  # Daily at 2 AM
        'options': {'queue': 'maintenance'}
    },
}

# Configure queues
celery_app.conf.task_routes = {
    'app.tasks.fetch_news.*': {'queue': 'news'},
    'app.tasks.fetch_stocks.*': {'queue': 'stocks'},
    'app.tasks.sentiment_analysis.*': {'queue': 'sentiment'},
    'app.tasks.cleanup.*': {'queue': 'maintenance'},
}

# Configure worker settings
celery_app.conf.worker_prefetch_multiplier = 1
celery_app.conf.task_acks_late = True
celery_app.conf.worker_disable_rate_limits = False

if __name__ == '__main__':
    celery_app.start()
