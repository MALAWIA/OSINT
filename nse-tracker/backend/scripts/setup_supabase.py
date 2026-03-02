#!/usr/bin/env python3
"""
Supabase Setup Script for NSE Intelligence Tracker

This script helps configure and test the Supabase connection for the application.
"""

import os
import sys
import json
from pathlib import Path

# Add the parent directory to the path so we can import app modules
sys.path.append(str(Path(__file__).parent.parent))

from app.core.config import settings
from app.core.supabase import initialize_supabase, get_supabase_client
from app.core.database import get_database_info, create_tables
import structlog

logger = structlog.get_logger()


def check_supabase_config():
    """Check if Supabase environment variables are configured."""
    print("🔍 Checking Supabase configuration...")
    
    required_vars = {
        'SUPABASE_URL': settings.SUPABASE_URL,
        'SUPABASE_KEY': settings.SUPABASE_KEY,
        'USE_SUPABASE': settings.USE_SUPABASE
    }
    
    optional_vars = {
        'SUPABASE_SERVICE_ROLE_KEY': settings.SUPABASE_SERVICE_ROLE_KEY,
        'SUPABASE_DB_URL': settings.SUPABASE_DB_URL
    }
    
    print("\n📋 Required Environment Variables:")
    all_configured = True
    for var, value in required_vars.items():
        status = "✅" if value else "❌"
        print(f"  {status} {var}: {'Set' if value else 'Not set'}")
        if not value:
            all_configured = False
    
    print("\n📋 Optional Environment Variables:")
    for var, value in optional_vars.items():
        status = "✅" if value else "⚠️"
        print(f"  {status} {var}: {'Set' if value else 'Not set (optional)'}")
    
    return all_configured


def test_supabase_connection():
    """Test the Supabase connection."""
    print("\n🔗 Testing Supabase connection...")
    
    try:
        # Initialize Supabase
        success = initialize_supabase()
        if not success:
            print("❌ Failed to initialize Supabase")
            return False
        
        # Get client
        client = get_supabase_client()
        if not client:
            print("❌ Failed to get Supabase client")
            return False
        
        # Test basic connection
        print("📡 Testing basic connection...")
        response = client.from_('users').select('count').execute()
        
        if hasattr(response, 'data') and response.data is not None:
            print("✅ Supabase connection successful!")
            print(f"📊 Users table count: {response.data}")
            return True
        else:
            print("❌ Unexpected response from Supabase")
            return False
            
    except Exception as e:
        print(f"❌ Supabase connection failed: {str(e)}")
        logger.error("Supabase connection test failed", error=str(e))
        return False


def create_database_tables():
    """Create database tables in Supabase."""
    print("\n🏗️  Creating database tables...")
    
    try:
        create_tables()
        print("✅ Database tables created successfully!")
        return True
    except Exception as e:
        print(f"❌ Failed to create database tables: {str(e)}")
        logger.error("Database table creation failed", error=str(e))
        return False


def show_database_info():
    """Show current database configuration."""
    print("\n📊 Database Configuration:")
    db_info = get_database_info()
    
    for key, value in db_info.items():
        if 'url' in key.lower():
            # Mask sensitive information in URLs
            if isinstance(value, str) and '://' in value:
                masked = value.split('://')[0] + '://***@' + value.split('@')[1] if '@' in value else value[:20] + '***'
                print(f"  {key}: {masked}")
            else:
                print(f"  {key}: {value}")
        else:
            print(f"  {key}: {value}")


def generate_env_template():
    """Generate a template .env file with Supabase configuration."""
    print("\n📝 Generating .env template...")
    
    env_template = f"""# NSE Intelligence Tracker Environment Variables

# Supabase Configuration
USE_SUPABASE=true
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
SUPABASE_DB_URL="postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres"

# Database Configuration (Fallback if USE_SUPABASE=false)
DATABASE_URL="postgresql://username:password@localhost:5432/nse_tracker"
POSTGRES_PASSWORD="your_postgres_password"
POSTGRES_USER="your_postgres_user"
POSTGRES_DB="nse_tracker"

# Other required variables...
JWT_SECRET="your_super_secret_jwt_key_here"
REDIS_URL="redis://localhost:6379/0"
# ... add other variables from .env.example
"""
    
    with open('.env.supabase', 'w') as f:
        f.write(env_template)
    
    print("✅ .env.supabase template created!")
    print("📝 Please copy this to .env and fill in your Supabase credentials")


def main():
    """Main setup function."""
    print("🚀 NSE Intelligence Tracker - Supabase Setup")
    print("=" * 50)
    
    # Check configuration
    if not check_supabase_config():
        print("\n❌ Supabase not properly configured!")
        print("📝 Please set the required environment variables:")
        print("   - USE_SUPABASE=true")
        print("   - SUPABASE_URL")
        print("   - SUPABASE_KEY")
        print("\n💡 You can get these from your Supabase project settings:")
        print("   1. Go to https://supabase.com")
        print("   2. Create or select your project")
        print("   3. Go to Settings > API")
        print("   4. Copy the URL and anon key")
        print("   5. Go to Settings > Database for connection string")
        
        generate_env_template()
        return False
    
    # Show database info
    show_database_info()
    
    # Test connection
    if not test_supabase_connection():
        print("\n❌ Supabase connection test failed!")
        print("🔧 Please check your:")
        print("   - Supabase URL and key")
        print("   - Network connectivity")
        print("   - Supabase project status")
        return False
    
    # Create tables
    if not create_database_tables():
        print("\n❌ Database table creation failed!")
        print("🔧 Please check your:")
        print("   - Database permissions")
        print("   - Supabase service role key")
        return False
    
    print("\n🎉 Supabase setup completed successfully!")
    print("✅ Your application is now configured to use Supabase!")
    print("\n📋 Next steps:")
    print("   1. Run the SQL setup script in Supabase SQL Editor:")
    print("      scripts/setup_supabase.sql")
    print("   2. Start your application: uvicorn app.main:app --reload")
    print("   3. Visit http://localhost:8000/health to check status")
    
    return True


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
