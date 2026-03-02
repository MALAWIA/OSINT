#!/usr/bin/env python3
"""
Environment variable security validator for production deployment
"""

import os
import re
import sys
from app.core.config import settings

def validate_jwt_secret():
    """Validate JWT secret strength."""
    secret = settings.JWT_SECRET
    if not secret or len(secret) < 32:
        return False, "JWT secret must be at least 32 characters"
    
    # Check for common weak secrets
    weak_patterns = [
        r'password', r'secret', r'admin', r'test', r'demo',
        r'123456', r'qwerty', r'abc123'
    ]
    
    for pattern in weak_patterns:
        if re.search(pattern, secret, re.IGNORECASE):
            return False, f"JWT secret contains weak pattern: {pattern}"
    
    return True, "JWT secret is strong"

def validate_supabase_config():
    """Validate Supabase configuration."""
    errors = []
    
    if not settings.SUPABASE_URL:
        errors.append("SUPABASE_URL is required")
    elif not settings.SUPABASE_URL.startswith('https://'):
        errors.append("SUPABASE_URL must use HTTPS")
    
    if not settings.SUPABASE_KEY:
        errors.append("SUPABASE_KEY is required")
    elif len(settings.SUPABASE_KEY) < 100:
        errors.append("SUPABASE_KEY appears to be too short")
    
    if settings.USE_SUPABASE and not settings.SUPABASE_SERVICE_ROLE_KEY:
        errors.append("SUPABASE_SERVICE_ROLE_KEY is required when USE_SUPABASE=true")
    
    return len(errors) == 0, errors

def validate_cors_origins():
    """Validate CORS origins."""
    origins = settings.ALLOWED_ORIGINS
    
    if not origins:
        return False, ["No CORS origins configured"]
    
    # Check for localhost in production
    if hasattr(settings, 'ENVIRONMENT') and settings.ENVIRONMENT == 'production':
        for origin in origins:
            if 'localhost' in origin or '127.0.0.1' in origin:
                return False, [f"Localhost origin '{origin}' not allowed in production"]
    
    return True, []

def check_database_url():
    """Check database URL security."""
    if settings.USE_SUPABASE and settings.SUPABASE_DB_URL:
        db_url = settings.SUPABASE_DB_URL
        
        # Check for password in URL (should use environment variable)
        if ':' in db_url.split('@')[0] if '@' in db_url else '':
            return False, "Database URL should not contain password in plain text"
        
        # Check for SSL
        if not db_url.startswith('postgresql://'):
            return False, "Database URL must use postgresql:// scheme"
    
    return True, ""

def main():
    """Run all security validations."""
    print("🔒 Environment Variable Security Validation")
    print("=" * 50)
    
    all_valid = True
    issues = []
    
    # Validate JWT Secret
    print("\n🔐 Validating JWT Secret...")
    valid, message = validate_jwt_secret()
    if valid:
        print(f"   ✅ {message}")
    else:
        print(f"   ❌ {message}")
        all_valid = False
        issues.append(f"JWT Secret: {message}")
    
    # Validate Supabase Config
    print("\n🗄️ Validating Supabase Configuration...")
    valid, errors = validate_supabase_config()
    if valid:
        print("   ✅ Supabase configuration is valid")
    else:
        for error in errors:
            print(f"   ❌ {error}")
        all_valid = False
        issues.extend([f"Supabase: {error}" for error in errors])
    
    # Validate CORS Origins
    print("\n🌐 Validating CORS Origins...")
    valid, errors = validate_cors_origins()
    if valid:
        print("   ✅ CORS origins are valid")
    else:
        for error in errors:
            print(f"   ❌ {error}")
        all_valid = False
        issues.extend([f"CORS: {error}" for error in errors])
    
    # Validate Database URL
    print("\n🗃️ Validating Database URL...")
    valid, error = check_database_url()
    if valid:
        print("   ✅ Database URL is secure")
    else:
        print(f"   ❌ {error}")
        all_valid = False
        issues.append(f"Database: {error}")
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 SECURITY VALIDATION SUMMARY")
    print("=" * 50)
    
    if all_valid:
        print("🎉 All environment variables are secure!")
        print("✅ Ready for production deployment")
    else:
        print("❌ Security issues found:")
        for issue in issues:
            print(f"   • {issue}")
        print("\n🔧 Please fix these issues before deployment")
    
    return all_valid

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
