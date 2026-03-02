#!/usr/bin/env python3
"""Test script to check Supabase connection only"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.supabase import initialize_supabase, get_supabase_client
from app.core.config import settings

print("🔍 Testing Supabase Configuration...")
print(f"USE_SUPABASE: {settings.USE_SUPABASE}")
print(f"SUPABASE_URL: {settings.SUPABASE_URL}")
print(f"SUPABASE_KEY configured: {bool(settings.SUPABASE_KEY)}")

print("\n🔗 Testing Supabase connection...")
try:
    success = initialize_supabase()
    if success:
        print("✅ Supabase initialized successfully!")
        
        client = get_supabase_client()
        if client:
            print("✅ Supabase client created!")
            
            # Test API connection
            response = client.from_('users').select('count').execute()
            print(f"✅ API connection successful! Users count: {response.data}")
            
            print("\n🎉 Supabase integration is working perfectly!")
        else:
            print("❌ Failed to get Supabase client")
    else:
        print("❌ Failed to initialize Supabase")
        
except Exception as e:
    print(f"❌ Error: {e}")
