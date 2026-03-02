import logging
import schedule
import time
import os
from datetime import datetime
from collectors import run_collection
from processors_simple import run_processing
from config import LOG_LEVEL, LOG_FILE, RSS_FETCH_INTERVAL, API_FETCH_INTERVAL

# Configure logging
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def setup_scheduler():
    """Setup scheduled tasks"""
    # RSS collection every 5 minutes
    schedule.every(RSS_FETCH_INTERVAL).seconds.do(run_collection)
    
    # API collection every 10 minutes
    schedule.every(API_FETCH_INTERVAL).seconds.do(run_collection)
    
    # Processing every 2 minutes
    schedule.every(120).seconds.do(run_processing)
    
    # Full sync every hour
    schedule.every().hour.do(full_sync)
    
    # Cleanup old data daily
    schedule.every().day.at("02:00").do(cleanup_old_data)

def full_sync():
    """Run full collection and processing cycle"""
    logger.info("Starting full sync cycle")
    try:
        run_collection()
        time.sleep(30)  # Wait for collection to complete
        run_processing()
        logger.info("Full sync completed successfully")
    except Exception as e:
        logger.error(f"Full sync failed: {e}")

def cleanup_old_data():
    """Clean up old data to maintain database performance"""
    logger.info("Starting data cleanup")
    try:
        # This would implement cleanup logic
        # For example, removing articles older than 90 days
        logger.info("Data cleanup completed")
    except Exception as e:
        logger.error(f"Data cleanup failed: {e}")

def main():
    """Main application entry point"""
    logger.info("Starting NSE OSINT Processor")
    
    # Setup scheduled tasks
    setup_scheduler()
    
    # Run initial collection and processing
    logger.info("Running initial collection and processing")
    try:
        run_collection()
        time.sleep(30)
        run_processing()
    except Exception as e:
        logger.error(f"Initial run failed: {e}")
    
    # Start scheduler loop
    logger.info("Starting scheduler loop")
    while True:
        try:
            schedule.run_pending()
            time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Shutting down OSINT Processor")
            break
        except Exception as e:
            logger.error(f"Scheduler error: {e}")
            time.sleep(10)  # Wait before retrying

if __name__ == "__main__":
    main()
