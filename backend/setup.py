#!/usr/bin/env python
"""
Setup script for Django NSE Authentication System
"""
import os
import sys
import subprocess
import django
from django.core.management import execute_from_command_line

def run_command(command):
    """Run a Django management command"""
    print(f"Running: {command}")
    try:
        execute_from_command_line(['manage.py'] + command.split())
        return True
    except Exception as e:
        print(f"Error running command: {e}")
        return False

def setup_project():
    """Set up the Django project"""
    print("🚀 Setting up Django NSE Authentication System...")
    
    # Create migrations
    if not run_command("makemigrations"):
        print("❌ Failed to create migrations")
        return False
    
    # Run migrations
    if not run_command("migrate"):
        print("❌ Failed to run migrations")
        return False
    
    # Create superuser
    print("👤 Creating superuser...")
    from django.contrib.auth.models import User
    if not User.objects.filter(is_superuser=True).exists():
        os.environ['DJANGO_SUPERUSER_PASSWORD'] = 'admin123'
        os.environ['DJANGO_SUPERUSER_EMAIL'] = 'admin@nse.com'
        os.environ['DJANGO_SUPERUSER_USERNAME'] = 'admin'
        
        if not run_command("createsuperuser --noinput --username admin --email admin@nse.com"):
            print("❌ Failed to create superuser")
            return False
    else:
        print("✅ Superuser already exists")
    
    print("✅ Django project setup complete!")
    return True

def run_tests():
    """Run the test suite"""
    print("🧪 Running authentication tests...")
    
    try:
        # Run the test file directly
        import subprocess
        result = subprocess.run([sys.executable, 'test_auth.py'], 
                              capture_output=True, 
                              text=True,
                              cwd=os.path.dirname(os.path.abspath(__file__)))
        
        if result.returncode == 0:
            print("✅ All tests passed!")
            return True
        else:
            print(f"❌ Tests failed:\n{result.stdout}\n{result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return False

def main():
    """Main setup function"""
    print("🔐 NSE Authentication System Setup")
    print("=" * 50)
    
    # Check if we're in the backend directory
    if not os.path.exists('manage.py'):
        print("❌ Error: manage.py not found. Please run this script from the backend directory.")
        return False
    
    # Set up Django
    if not setup_project():
        return False
    
    # Run tests
    if not run_tests():
        return False
    
    print("\n🎉 Setup complete! Django authentication system is ready.")
    print("\n📋 Available API endpoints:")
    print("  • POST /api/auth/register/ - User registration")
    print("  • POST /api/auth/login/ - User login")
    print("  • POST /api/auth/logout/ - User logout")
    print("  • GET /api/auth/profile/ - User profile")
    print("  • GET /api/users/ - List users (admin only)")
    print("\n🔐 Default admin credentials:")
    print("  • Email: admin@nse.com")
    print("  • Password: admin123")
    print("\n🌐 To start the development server:")
    print("  python manage.py runserver")
    print("\n📚 To run tests:")
    print("  python test_auth.py")

if __name__ == '__main__':
    main()
