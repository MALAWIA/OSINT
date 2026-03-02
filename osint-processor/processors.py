import re
import logging
from datetime import datetime
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import spacy
from collections import defaultdict
from database import db
from config import NSE_COMPANIES, EVENT_KEYWORDS, SENTIMENT_THRESHOLD, EVENT_CONFIDENCE_THRESHOLD, MENTION_CONFIDENCE_THRESHOLD

logger = logging.getLogger(__name__)

# Load NLP models
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    logger.error("spaCy model not found. Please run: python -m spacy download en_core_web_sm")
    nlp = None

# Initialize sentiment analyzer
sentiment_analyzer = SentimentIntensityAnalyzer()

class TextProcessor:
    def __init__(self):
        self.companies = NSE_COMPANIES
        self.event_keywords = EVENT_KEYWORDS
        self.nlp = nlp
        self.sentiment_analyzer = sentiment_analyzer
    
    def extract_company_mentions(self, text):
        """Extract company mentions from text with confidence scores"""
        mentions = []
        
        if not self.nlp:
            return mentions
        
        doc = self.nlp(text)
        
        # Method 1: Direct ticker matching
        for ticker, company_name in self.companies.items():
            # Check for ticker patterns (e.g., $SCOM, SCOM)
            ticker_patterns = [
                rf'\${ticker}',  # $SCOM
                rf'\b{ticker}\b',  # SCOM as whole word
                rf'\b{ticker}\.\b',  # SCOM. with period
            ]
            
            for pattern in ticker_patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                if matches:
                    mentions.append({
                        'ticker': ticker,
                        'company_name': company_name,
                        'mention_count': len(matches),
                        'confidence': 0.9  # High confidence for ticker matches
                    })
        
        # Method 2: Company name matching with spaCy NER
        for ent in doc.ents:
            if ent.label_ in ['ORG', 'PERSON']:
                entity_text = ent.text.lower()
                
                # Check against company names
                for ticker, company_name in self.companies.items():
                    company_words = company_name.lower().split()
                    
                    # Check if entity contains company name words
                    if any(word in entity_text for word in company_words):
                        # Calculate confidence based on match quality
                        confidence = self._calculate_name_confidence(entity_text, company_name)
                        
                        if confidence >= MENTION_CONFIDENCE_THRESHOLD:
                            mentions.append({
                                'ticker': ticker,
                                'company_name': company_name,
                                'mention_count': 1,
                                'confidence': confidence
                            })
        
        # Remove duplicates and aggregate counts
        aggregated_mentions = defaultdict(lambda: {'mention_count': 0, 'confidence': 0, 'company_name': ''})
        
        for mention in mentions:
            ticker = mention['ticker']
            aggregated_mentions[ticker]['mention_count'] += mention['mention_count']
            aggregated_mentions[ticker]['confidence'] = max(
                aggregated_mentions[ticker]['confidence'], 
                mention['confidence']
            )
            aggregated_mentions[ticker]['company_name'] = mention['company_name']
        
        return [
            {
                'ticker': ticker,
                'company_name': data['company_name'],
                'mention_count': data['mention_count'],
                'confidence': data['confidence']
            }
            for ticker, data in aggregated_mentions.items()
        ]
    
    def _calculate_name_confidence(self, entity_text, company_name):
        """Calculate confidence score for company name matching"""
        entity_words = set(entity_text.split())
        company_words = set(company_name.lower().split())
        
        # Jaccard similarity
        intersection = entity_words & company_words
        union = entity_words | company_words
        
        if not union:
            return 0.0
        
        similarity = len(intersection) / len(union)
        
        # Boost confidence for exact matches
        if company_name.lower() in entity_text:
            similarity += 0.2
        
        return min(similarity, 1.0)
    
    def analyze_sentiment(self, text):
        """Analyze sentiment of text"""
        try:
            scores = self.sentiment_analyzer.polarity_scores(text)
            
            compound_score = scores['compound']
            
            # Determine sentiment label
            if compound_score >= 0.05:
                label = 'positive'
            elif compound_score <= -0.05:
                label = 'negative'
            else:
                label = 'neutral'
            
            return {
                'sentiment_score': compound_score,
                'sentiment_label': label,
                'confidence': abs(compound_score)
            }
        except Exception as e:
            logger.error(f"Sentiment analysis failed: {e}")
            return {
                'sentiment_score': 0.0,
                'sentiment_label': 'neutral',
                'confidence': 0.0
            }
    
    def detect_events(self, text):
        """Detect financial events in text"""
        events = []
        text_lower = text.lower()
        
        for event_type, keywords in self.event_keywords.items():
            keyword_matches = 0
            matched_keywords = []
            
            for keyword in keywords:
                if keyword in text_lower:
                    keyword_matches += 1
                    matched_keywords.append(keyword)
            
            if keyword_matches > 0:
                # Calculate confidence based on keyword density
                total_keywords = len(keywords)
                confidence = min(keyword_matches / total_keywords, 1.0)
                
                # Boost confidence for multiple keyword matches
                if keyword_matches >= 2:
                    confidence = min(confidence + 0.2, 1.0)
                
                if confidence >= EVENT_CONFIDENCE_THRESHOLD:
                    # Generate event summary
                    summary = self._generate_event_summary(text, event_type, matched_keywords)
                    
                    events.append({
                        'event_type': event_type,
                        'confidence': confidence,
                        'summary': summary
                    })
        
        return events
    
    def _generate_event_summary(self, text, event_type, keywords):
        """Generate a brief summary of the detected event"""
        # Extract sentences containing event keywords
        sentences = text.split('.')
        relevant_sentences = []
        
        for sentence in sentences:
            sentence_lower = sentence.lower()
            if any(keyword in sentence_lower for keyword in keywords):
                relevant_sentences.append(sentence.strip())
        
        # Take the most relevant sentence (first one with most keywords)
        if relevant_sentences:
            summary = relevant_sentences[0]
            if len(summary) > 200:
                summary = summary[:200] + "..."
            return summary
        
        # Fallback summary
        event_descriptions = {
            'earnings': 'Financial performance or earnings-related activity',
            'acquisition': 'Business acquisition or merger activity',
            'regulation': 'Regulatory or compliance-related development',
            'leadership': 'Leadership or management changes',
            'financial': 'Financial transactions or funding activities',
            'legal': 'Legal proceedings or disputes'
        }
        
        return event_descriptions.get(event_type, 'General business activity')

class OSINTProcessor:
    def __init__(self):
        self.text_processor = TextProcessor()
    
    def process_article(self, article):
        """Process a single news article"""
        try:
            article_id = article['id']
            raw_text = article['raw_text']
            
            if not raw_text or len(raw_text.strip()) < 50:
                logger.warning(f"Article {article_id} has insufficient content")
                return
            
            logger.info(f"Processing article: {article['title'][:50]}...")
            
            # Extract company mentions
            mentions = self.text_processor.extract_company_mentions(raw_text)
            
            # Get company IDs from database
            companies = db.get_companies()
            company_map = {comp['ticker']: comp for comp in companies}
            
            # Process each mention
            for mention in mentions:
                ticker = mention['ticker']
                if ticker in company_map:
                    company = company_map[ticker]
                    
                    # Insert company mention
                    db.insert_company_mention(
                        article_id,
                        company['id'],
                        mention['mention_count'],
                        mention['confidence']
                    )
                    
                    # Analyze sentiment for this company
                    sentiment = self.text_processor.analyze_sentiment(raw_text)
                    
                    if sentiment['confidence'] >= SENTIMENT_THRESHOLD:
                        db.insert_sentiment_analysis(
                            article_id,
                            company['id'],
                            sentiment['sentiment_score'],
                            sentiment['sentiment_label'],
                            sentiment['confidence']
                        )
                    
                    # Detect events
                    events = self.text_processor.detect_events(raw_text)
                    
                    for event in events:
                        db.insert_detected_event(
                            article_id,
                            company['id'],
                            event['event_type'],
                            event['summary'],
                            event['confidence']
                        )
            
            # Mark article as processed
            db.mark_article_processed(article_id)
            
            logger.info(f"Processed article {article_id} with {len(mentions)} company mentions")
            
        except Exception as e:
            logger.error(f"Error processing article {article['id']}: {e}")
    
    def process_unprocessed_articles(self):
        """Process all unprocessed articles"""
        logger.info("Starting OSINT processing cycle")
        
        articles = db.get_unprocessed_articles()
        
        if not articles:
            logger.info("No unprocessed articles found")
            return
        
        logger.info(f"Found {len(articles)} unprocessed articles")
        
        for article in articles:
            try:
                self.process_article(article)
            except Exception as e:
                logger.error(f"Failed to process article {article['id']}: {e}")
                continue
        
        logger.info("OSINT processing cycle completed")

def run_processing():
    processor = OSINTProcessor()
    processor.process_unprocessed_articles()
