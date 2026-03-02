#!/usr/bin/env python3
"""Test script to check health endpoint"""

import urllib.request
import json

try:
    with urllib.request.urlopen("http://127.0.0.1:8000/health") as response:
        data = response.read()
        print(f"Status Code: {response.status}")
        print(f"Response: {json.loads(data.decode('utf-8'))}")
except Exception as e:
    print(f"Error: {e}")
