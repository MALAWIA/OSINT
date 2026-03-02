import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://nse_user:nse_password@localhost:5432/nse_intelligence')

# Redis Configuration
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')

# Elasticsearch Configuration
ELASTICSEARCH_URL = os.getenv('ELASTICSEARCH_URL', 'http://localhost:9200')

# OSINT Collection Settings
RSS_FETCH_INTERVAL = int(os.getenv('RSS_FETCH_INTERVAL', 300))  # 5 minutes
API_FETCH_INTERVAL = int(os.getenv('API_FETCH_INTERVAL', 600))  # 10 minutes
MAX_ARTICLES_PER_SOURCE = int(os.getenv('MAX_ARTICLES_PER_SOURCE', 50))

# NLP Processing Settings
SENTIMENT_THRESHOLD = float(os.getenv('SENTIMENT_THRESHOLD', 0.6))
EVENT_CONFIDENCE_THRESHOLD = float(os.getenv('EVENT_CONFIDENCE_THRESHOLD', 0.7))
MENTION_CONFIDENCE_THRESHOLD = float(os.getenv('MENTION_CONFIDENCE_THRESHOLD', 0.8))

# Logging
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FILE = os.getenv('LOG_FILE', 'logs/osint_processor.log')

# Rate Limiting
REQUEST_DELAY = float(os.getenv('REQUEST_DELAY', 1.0))  # seconds between requests
MAX_RETRIES = int(os.getenv('MAX_RETRIES', 3))

# Content Deduplication
CONTENT_HASH_ALGORITHM = 'sha256'
SIMILARITY_THRESHOLD = float(os.getenv('SIMILARITY_THRESHOLD', 0.9))

# NSE Company Tickers for Entity Recognition
NSE_COMPANIES = {
    'SCOM': 'Safaricom PLC',
    'EQTY': 'Equity Group Holdings',
    'KCB': 'KCB Group',
    'COOP': 'Co-operative Bank',
    'BAT': 'British American Tobacco Kenya',
    'EABL': 'East African Breweries',
    'NMG': 'Nation Media Group',
    'JUB': 'Jubilee Holdings',
    'UAP': 'UAP Holdings',
    'BRITAM': 'Britam Holdings',
    'CFC': 'CFC Stanbic',
    'DTB': 'Diamond Trust Bank',
    'ABSA': 'Absa Bank Kenya',
    'NCBA': 'NCBA Group',
    'I&M': 'I&M Holdings',
    'STANBIC': 'Stanbic Bank',
    'KENGEN': 'Kenya Electricity Generating',
    'KENGEN': 'Kenya Electricity Generating',
    'KPLC': 'Kenya Power',
    'TPS': 'TPS Eastern Africa',
    'BAMBURI': 'Bamburi Cement',
    'ATHI': 'Athi River Mining',
    'ARM': 'Athi River Mining',
    'CARBACID': 'Carbacid Investments',
    'KAKUZI': 'Kakuzi',
    'LIMURU': 'Limuru Tea',
    'WILLIAMSON': 'Williamson Tea',
    'KAPCHORUA': 'Kapchorua Tea',
    'SASINI': 'Sasini',
    'EKA': 'Eka Holdings',
    'HFL': 'Housing Finance',
    'HFCK': 'Housing Finance',
    'COOPBANK': 'Co-operative Bank',
    'CIC': 'CIC Insurance',
    'GA': 'GA Insurance',
    'JUBH': 'Jubilee Holdings',
    'LONSTAR': 'Lonrho Africa',
    'MUMIAS': 'Mumias Sugar',
    'MUMSUG': 'Mumias Sugar',
    'NATION': 'Nation Media Group',
    'NMG': 'Nation Media Group',
    'NSEL': 'Nairobi Securities Exchange',
    'NSE': 'Nairobi Securities Exchange',
    'ORPOWER': 'OrPower 22',
    'TSL': 'TransCentury',
    'WPP': 'WPP Scangroup',
    'SCAN': 'WPP Scangroup',
    'KQ': 'Kenya Airways',
    'KENYA': 'Kenya Airways',
    'CENTUM': 'Centum Investment',
    'CITY': 'City Trust',
    'KURW': 'Kurus International',
    'LIBERTY': 'Liberty Kenya',
    'APO': 'Apollo Holdings',
    'KAPC': 'Kapchorua Tea',
    'KENTEA': 'Kenya Tea',
    'REAV': 'Rea Vipingo',
    'SPE': 'Safepak',
    'TRV': 'Trident Trust',
    'UAPOLD': 'UAP Holdings',
    'XPRS': 'Express Kenya',
}

# Event Type Keywords
EVENT_KEYWORDS = {
    'earnings': ['earnings', 'profit', 'loss', 'revenue', 'dividend', 'results', 'quarterly', 'annual', 'financial'],
    'acquisition': ['acquire', 'acquisition', 'merger', 'takeover', 'buy', 'purchase', 'deal', 'agreement'],
    'regulation': ['regulation', 'regulator', 'cma', 'capital markets', 'compliance', 'license', 'fine', 'penalty'],
    'leadership': ['ceo', 'md', 'managing director', 'chief executive', 'appointment', 'resignation', 'board', 'director'],
    'financial': ['loan', 'credit', 'debt', 'financing', 'investment', 'capital', 'funding', 'bond'],
    'legal': ['lawsuit', 'court', 'legal', 'case', 'dispute', 'litigation', 'settlement']
}

# Moderation Keywords
MODERATION_KEYWORDS = [
    'guaranteed returns',
    'buy now',
    'sell now',
    'inside info',
    'insider trading',
    'pump and dump',
    'signal group',
    'hot tip',
    'sure thing',
    'easy money',
    'quick profit',
    'no risk',
    'certain profit'
]
