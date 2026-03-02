#!/usr/bin/env python3
"""
Simple FastAPI server for Vercel deployment
Minimal dependencies to avoid compatibility issues
"""

import os
import sys
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Create minimal FastAPI app
app = FastAPI(title="NSE Intelligence Tracker API")

@app.get("/")
async def root():
    """Root endpoint."""
    return JSONResponse({
        "message": "NSE Intelligence Tracker API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "auth": "/api/auth"
        }
    })

@app.get("/health")
async def health():
    """Simple health check."""
    return JSONResponse({
        "status": "healthy",
        "service": "nse-tracker-api",
        "version": "1.0.0"
    })

@app.get("/api/health")
async def api_health():
    """API health check endpoint."""
    return JSONResponse({
        "status": "healthy",
        "service": "nse-tracker-api",
        "database": "supabase",
        "version": "1.0.0"
    })

# Vercel serverless handler
handler = app
