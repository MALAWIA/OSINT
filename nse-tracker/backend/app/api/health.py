#!/usr/bin/env python3
"""
Simple health check for Vercel deployment
"""

from fastapi import FastAPI
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.supabase import initialize_supabase, get_supabase_client
from app.core.config import settings

# Create a simple FastAPI app for health check
health_app = FastAPI()

@health_app.get("/health")
async def simple_health_check():
    """Simple health check for deployment."""
    try:
        # Test Supabase connection
        supabase_client = get_supabase_client()
        if supabase_client:
            # Quick API test
            response = supabase_client.from_('users').select('count').execute()
            return {
                "status": "healthy",
                "supabase": "connected",
                "users_count": response.data[0]['count'] if response.data else 0,
                "environment": settings.ENVIRONMENT if hasattr(settings, 'ENVIRONMENT') else "development"
            }
        else:
            return {
                "status": "degraded",
                "supabase": "not_connected"
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

# Vercel serverless handler
handler = health_app
