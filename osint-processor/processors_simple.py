import re
import logging
from datetime import datetime
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from collections import defaultdict
from database import db
from config import NSE_COMPANIES, EVENT_KEYWORDS, SENTIMENT_THRESHOLD, EVENT_CONFIDENCE_THRESHOLD, MENTION_CONFIDENCE_THRESHOLD

logger = logging.getLogger(__name__)

# Initialize VADER sentiment analyzer
sentiment_analyzer = SentimentIntensityAnalyzer()

def extract_entities(text, companies):
    """Simple entity extraction using keyword matching"""
    entities = []
    text_lower = text.lower()
    
    for ticker, company_name in NSE_COMPANIES.items():
        if ticker.lower() in text_lower or company_name.lower() in text_lower:
            entities.append({
                'text': ticker,
                'label': 'ORG',
                'confidence': 0.8,
                'company_id': ticker
            })
    
    return entities

def extract_keywords(text):
    """Simple keyword extraction"""
    # Remove common stop words and extract important terms
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'can', 'shall'}
    
    words = re.findall(r'\b\w+\b', text.lower())
    keywords = [word for word in words if len(word) > 2 and word not in stop_words]
    
    # Return top keywords by frequency
    keyword_freq = defaultdict(int)
    for keyword in keywords:
        keyword_freq[keyword] += 1
    
    return sorted(keyword_freq.items(), key=lambda x: x[1], reverse=True)[:10]

def analyze_sentiment(text):
    """Analyze sentiment using VADER"""
    scores = sentiment_analyzer.polarity_scores(text)
    
    sentiment_score = scores['compound']
    
    if sentiment_score >= 0.05:
        sentiment_label = 'positive'
    elif sentiment_score <= -0.05:
        sentiment_label = 'negative'
    else:
        sentiment_label = 'neutral'
    
    return {
        'score': sentiment_score,
        'label': sentiment_label,
        'confidence': abs(sentiment_score)
    }

def detect_events(text, entities):
    """Simple event detection using keyword matching"""
    events = []
    text_lower = text.lower()
    
    for event_type, keywords in EVENT_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text_lower:
                events.append({
                    'text': keyword,
                    'type': event_type,
                    'confidence': 0.7,
                    'detected_at': datetime.now().isoformat()
                })
                break  # Only detect one event per type per article
    
    return events

def run_processing():
    """Main processing function"""
    logger.info("Starting NLP processing")
    
    try:
        # Get unprocessed articles
        articles = db.get_unprocessed_articles(limit=50)
        
        if not articles:
            logger.info("No unprocessed articles found")
            return
        
        logger.info(f"Processing {len(articles)} articles")
        
        for article in articles:
            try:
                logger.info(f"Processing article: {article['id']}")
                
                # Extract entities
                entities = extract_entities(article['content'], NSE_COMPANIES)
                
                # Extract keywords
                keywords = extract_keywords(article['content'])
                
                # Analyze sentiment
                sentiment = analyze_sentiment(article['content'])
                
                # Detect events
                events = detect_events(article['content'], entities)
                
                # Update article with analysis results
                db.update_article_analysis(
                    article['id'],
                    {
                        'entities': entities,
                        'keywords': keywords,
                        'sentiment': sentiment,
                        'events': events,
                        'processed_at': datetime.now().isoformat()
                    }
                )
                
                # Create company mentions
                for entity in entities:
                    if entity['label'] == 'ORG':
                        db.create_company_mention({
                            'article_id': article['id'],
                            'company_id': entity['company_id'],
                            'mention_text': entity['text'],
                            'position': article['content'].find(entity['text']),
                            'confidence': entity['confidence'],
                            'is_primary': True
                        })
                
                # Create detected events
                for event in events:
                    db.create_detected_event({
                        'article_id': article['id'],
                        'event_type': event['type'],
                        'event_text': event['text'],
                        'confidence': event['confidence'],
                        'is_verified': False,
                        'detected_at': event['detected_at']
                    })
                
                # Create sentiment analysis records
                for entity in entities:
                    if entity['label'] == 'ORG':
                        db.create_sentiment_analysis({
                            'article_id': article['id'],
                            'company_id': entity['company_id'],
                            'sentiment_score': sentiment['score'],
                            'sentiment_label': sentiment['label'],
                            'confidence': sentiment['confidence'],
                            'entities': [entity],
                            'keywords': keywords[:5]  # Top 5 keywords
                        })
                
                logger.info(f"Successfully processed article: {article['id']}")
                
            except Exception as e:
                logger.error(f"Failed to process article {article['id']}: {e}")
                db.mark_article_failed(article['id'], str(e))
        
        logger.info(f"Processing completed for {len(articles)} articles")
        
    except Exception as e:
        logger.error(f"Processing failed: {e}")

if __name__ == "__main__":
    run_processing()
