#!/usr/bin/env python
"""
🚀 Frontend Authentication System Starter
Script to start the React frontend with authentication
"""
import os
import sys
import subprocess
import time
from pathlib import Path

def print_header():
    """Print startup header"""
    print("🚀 NSE AUTHENTICATION SYSTEM - FRONTEND STARTER")
    print("=" * 60)
    print("📋 Starting React frontend with authentication system")
    print("🔐 Features: Login, Signup, Dashboard, Protected Routes")
    print("=" * 60)

def check_prerequisites():
    """Check if prerequisites are met"""
    print("🔍 CHECKING PREREQUISITES...")
    
    # Check if we're in the frontend directory
    current_dir = Path.cwd()
    if not (current_dir / 'package.json').exists():
        print("❌ Error: package.json not found. Please run this from the frontend directory.")
        return False
    
    # Check if node_modules exists
    if not (current_dir / 'node_modules').exists():
        print("⚠️  Warning: node_modules not found. Running npm install...")
        try:
            subprocess.run(['npm', 'install'], check=True, capture_output=True)
            print("✅ Dependencies installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error installing dependencies: {e}")
            return False
    
    print("✅ Prerequisites check passed")
    return True

def start_frontend():
    """Start the React frontend"""
    print("\n🎨 STARTING REACT FRONTEND...")
    print("📍 URL: http://localhost:3000")
    print("🔗 Backend should be running on: http://localhost:8000")
    print("\n📋 Available Routes:")
    print("   • / (Login) - Main login page")
    print("   • /login - Login page")
    print("   • /signup - User registration")
    print("   • /registration-success - Success page after signup")
    print("   • /dashboard - Protected dashboard (requires login)")
    print("   • /profile - User profile (protected)")
    print("   • /change-password - Password change (protected)")
    print("   • /security - Security settings (protected)")
    print("   • /forgot-password - Password reset (public)")
    print("\n🔐 Authentication Features:")
    print("   • Dual-factor authentication (email + password + unique ID)")
    print("   • Form validation with real-time feedback")
    print("   • Password strength indicators")
    print("   • Remember me functionality")
    print("   • Protected routes with automatic redirect")
    print("   • User session management")
    print("   • Responsive design for all devices")
    print("\n" + "=" * 60)
    print("🚀 Starting development server...")
    print("💡 Press Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        # Start the React development server
        subprocess.run(['npm', 'start'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting frontend: {e}")
        return False
    except KeyboardInterrupt:
        print("\n\n👋 Frontend server stopped by user")
        return True
    
    return True

def show_next_steps():
    """Show next steps after starting"""
    print("\n🎯 NEXT STEPS:")
    print("1. Open http://localhost:3000 in your browser")
    print("2. Test user registration:")
    print("   - Click 'Create your account'")
    print("   - Fill in all required fields")
    print("   - Submit and check success page")
    print("3. Test user login:")
    print("   - Enter email, password, and unique ID")
    print("   - Verify dashboard access")
    print("4. Test protected routes:")
    print("   - Try accessing /dashboard without login")
    print("   - Verify redirect to login")
    print("5. Test authentication flow:")
    print("   - Logout and verify session cleanup")
    print("   - Test remember me functionality")
    print("\n🔧 FOR TESTING:")
    print("   • Run: python test_frontend_auth.py")
    print("   • Or: python run_auth_tests.py")
    print("\n📚 DOCUMENTATION:")
    print("   • README.md - Setup and usage guide")
    print("   • useAuth.ts - Authentication hook documentation")

def main():
    """Main function"""
    print_header()
    
    # Check prerequisites
    if not check_prerequisites():
        print("\n❌ Cannot start frontend - prerequisites not met")
        return 1
    
    # Start frontend
    if start_frontend():
        show_next_steps()
        return 0
    else:
        return 1

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
