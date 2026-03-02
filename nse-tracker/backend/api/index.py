#!/usr/bin/env python3
"""
Vercel serverless adapter for FastAPI application
"""

import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the FastAPI app
from app.main import app

# Vercel serverless handler
handler = app
