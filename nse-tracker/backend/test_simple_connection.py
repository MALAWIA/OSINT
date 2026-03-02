#!/usr/bin/env python3
"""Simple connection test"""

import requests
import time

try:
    print("Testing basic connection to application...")
    response = requests.get("http://127.0.0.1:8000/", timeout=2)
    print(f"Root endpoint: {response.status_code}")
    
    response = requests.get("http://127.0.0.1:8000/docs", timeout=2)
    print(f"Docs endpoint: {response.status_code}")
    
    response = requests.get("http://127.0.0.1:8000/health", timeout=10)
    print(f"Health endpoint: {response.status_code}")
    
except Exception as e:
    print(f"Error: {e}")
