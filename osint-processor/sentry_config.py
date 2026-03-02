"""
Sentry configuration for OSINT Processor
Error tracking and performance monitoring
"""

import os
import sys
import sentry_sdk
from sentry_sdk.integrations.redis import RedisIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.httpx import HttpxIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
from sentry_sdk.integrations.threading import ThreadingIntegration
from sentry_sdk.integrations.argv import ArgvIntegration
from sentry_sdk.integrations.atexit import AtexitIntegration


def init_sentry():
    """Initialize Sentry for error tracking"""
    
    sentry_dsn = os.getenv('SENTRY_DSN')
    if not sentry_dsn:
        print("Warning: SENTRY_DSN not configured, skipping Sentry initialization")
        return
    
    environment = os.getenv('NODE_ENV', 'development')
    release = os.getenv('APP_VERSION', '1.0.0')
    
    # Configure logging integration
    logging_integration = LoggingIntegration(
        level=os.getenv('SENTRY_LOG_LEVEL', 'INFO'),  # Capture info and above as breadcrumbs
        event_level=os.getenv('SENTRY_EVENT_LEVEL', 'ERROR')  # Send errors as events
    )
    
    sentry_sdk.init(
        dsn=sentry_dsn,
        environment=environment,
        release=release,
        
        # Performance monitoring
        traces_sample_rate=float(os.getenv('SENTRY_TRACES_SAMPLE_RATE', '0.1')),
        profiles_sample_rate=float(os.getenv('SENTRY_PROFILES_SAMPLE_RATE', '1.0')),
        
        # Integrations
        integrations=[
            RedisIntegration(),
            SqlalchemyIntegration(),
            HttpxIntegration(),
            logging_integration,
            ThreadingIntegration(),
            ArgvIntegration(),
            AtexitIntegration(),
        ],
        
        # Before send hook for filtering
        before_send=before_send_filter,
        
        # Before breadcrumb hook for filtering
        before_breadcrumb=before_breadcrumb_filter,
        
        # Error classification
        classify_errors=True,
        
        # Debug mode (only in development)
        debug=environment == 'development',
        
        # Maximum number of breadcrumbs
        max_breadcrumbs=int(os.getenv('SENTRY_MAX_BREADCRUMBS', '100')),
        
        # Send default PII
        send_default_pii=False,
        
        # Attach stacktrace
        attach_stacktrace=True,
    )
    
    # Set global tags
    sentry_sdk.set_tag('service', 'nse-osint')
    sentry_sdk.set_tag('environment', environment)
    sentry_sdk.set_tag('python_version', f"{sys.version_info.major}.{sys.version_info.minor}")
    
    # Set user context if available
    user_id = os.getenv('SENTRY_USER_ID')
    if user_id:
        sentry_sdk.set_user({
            'id': user_id,
            'email': os.getenv('SENTRY_USER_EMAIL'),
        })
    
    print(f"Sentry initialized for OSINT processor in {environment} environment")


def before_send_filter(event, hint):
    """Filter and enrich events before sending to Sentry"""
    
    # Filter out certain errors
    if 'exception' in event:
        error = hint.get('original_exception')
        
        # Filter out health check errors in production
        if os.getenv('NODE_ENV') == 'production':
            if isinstance(error, Exception) and 'health' in str(error).lower():
                return None
        
        # Filter out network timeout errors
        if isinstance(error, Exception) and any(keyword in str(error).lower() 
                                                  for keyword in ['timeout', 'connection', 'network']):
            event.level = 'warning'
    
    # Add custom context
    event['tags'] = {
        **event.get('tags', {}),
        'service': 'nse-osint',
        'version': os.getenv('APP_VERSION', 'unknown'),
        'hostname': os.getenv('HOSTNAME', 'unknown'),
    }
    
    event['contexts'] = {
        **event.get('contexts', {}),
        'app': {
            'name': 'NSE Intelligence OSINT Processor',
            'version': os.getenv('APP_VERSION', 'unknown'),
            'environment': os.getenv('NODE_ENV', 'development'),
        },
        'runtime': {
            'name': 'python',
            'version': f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        },
    }
    
    # Sanitize sensitive data
    if 'request' in event:
        event['request'] = sanitize_request(event['request'])
    
    return event


def before_breadcrumb_filter(breadcrumb, hint):
    """Filter breadcrumbs before sending to Sentry"""
    
    # Filter out certain breadcrumbs
    if breadcrumb.get('category') == 'http':
        url = breadcrumb.get('data', {}).get('url', '')
        
        # Filter out health check URLs
        if '/health' in url or '/metrics' in url:
            return None
        
        # Filter out internal URLs
        if any(internal in url for internal in ['localhost', '127.0.0.1', 'internal']):
            breadcrumb['data']['url'] = '[INTERNAL]'
    
    # Sanitize breadcrumb data
    if 'data' in breadcrumb:
        breadcrumb['data'] = sanitize_breadcrumb_data(breadcrumb['data'])
    
    return breadcrumb


def sanitize_request(request):
    """Sanitize request data to remove sensitive information"""
    
    if not request:
        return request
    
    sanitized = request.copy()
    
    # Sanitize headers
    if 'headers' in sanitized:
        sanitized['headers'] = sanitize_headers(sanitized['headers'])
    
    # Sanitize cookies
    if 'cookies' in sanitized:
        sanitized['cookies'] = {'*': '[REDACTED]'}
    
    # Sanitize query string
    if 'query_string' in sanitized:
        sanitized['query_string'] = sanitize_query_string(sanitized['query_string'])
    
    return sanitized


def sanitize_headers(headers):
    """Sanitize headers to remove sensitive information"""
    
    if not headers:
        return headers
    
    sanitized = {}
    sensitive_headers = ['authorization', 'cookie', 'x-api-key', 'x-auth-token']
    
    for key, value in headers.items():
        if key.lower() in sensitive_headers:
            sanitized[key] = '[REDACTED]'
        else:
            sanitized[key] = value
    
    return sanitized


def sanitize_query_string(query_string):
    """Sanitize query string to remove sensitive parameters"""
    
    if not query_string:
        return query_string
    
    # This is a simple implementation - in production you might want more sophisticated parsing
    sensitive_params = ['token', 'key', 'password', 'secret']
    
    for param in sensitive_params:
        if param in query_string.lower():
            return '[REDACTED]'
    
    return query_string


def sanitize_breadcrumb_data(data):
    """Sanitize breadcrumb data to remove sensitive information"""
    
    if not data:
        return data
    
    sanitized = data.copy()
    sensitive_keys = ['password', 'token', 'secret', 'key', 'authorization']
    
    for key in list(sanitized.keys()):
        if any(sensitive in key.lower() for sensitive in sensitive_keys):
            sanitized[key] = '[REDACTED]'
    
    return sanitized


def capture_exception(error, context=None):
    """Capture exception with optional context"""
    
    if context:
        sentry_sdk.set_context('custom_context', context)
    
    sentry_sdk.capture_exception(error)


def capture_message(message, level='info'):
    """Capture message with specified level"""
    
    sentry_sdk.capture_message(message, level)


def add_breadcrumb(category, message, level='info', data=None):
    """Add breadcrumb to Sentry"""
    
    sentry_sdk.add_breadcrumb(
        category=category,
        message=message,
        level=level,
        data=data
    )


def set_user(user_info):
    """Set user context in Sentry"""
    
    sentry_sdk.set_user(user_info)


def set_tag(key, value):
    """Set tag in Sentry"""
    
    sentry_sdk.set_tag(key, value)


def set_context(key, value):
    """Set context in Sentry"""
    
    sentry_sdk.set_context(key, value)


# Global exception handler
def handle_global_exception(exc_type, exc_value, exc_traceback):
    """Global exception handler for uncaught exceptions"""
    
    if issubclass(exc_type, KeyboardInterrupt):
        # Don't capture KeyboardInterrupt
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
        return
    
    sentry_sdk.capture_exception(exc_value)
    sys.__excepthook__(exc_type, exc_value, exc_traceback)


# Set global exception handler
sys.excepthook = handle_global_exception
