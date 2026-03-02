#!/usr/bin/env python
"""
🧪 Quick Authentication Test Runner
Simple script to test the authentication system
"""
import os
import sys
import subprocess
from datetime import datetime

def print_header():
    """Print test header"""
    print("🧪 AUTHENTICATION SYSTEM TEST RUNNER")
    print("=" * 50)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)

def print_menu():
    """Print test menu"""
    print("\n🎯 Select Test Type:")
    print("1. Backend API Tests Only")
    print("2. Frontend Component Tests Only")
    print("3. Complete System Tests (Recommended)")
    print("4. Quick Health Check")
    print("5. Exit")
    print()

def run_backend_tests():
    """Run backend tests"""
    print("🔧 Running Backend Tests...")
    print("-" * 30)
    
    try:
        # Check if backend test script exists
        if not os.path.exists("backend/test_authentication_flow.py"):
            print("❌ Backend test script not found!")
            return False
        
        # Run backend tests
        result = subprocess.run([
            sys.executable, 
            "backend/test_authentication_flow.py"
        ], capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            print("✅ Backend tests completed successfully")
            return True
        else:
            print("❌ Backend tests failed")
            print("Error output:")
            print(result.stderr)
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Backend tests timed out")
        return False
    except Exception as e:
        print(f"❌ Error running backend tests: {e}")
        return False

def run_frontend_tests():
    """Run frontend tests"""
    print("🎨 Running Frontend Tests...")
    print("-" * 30)
    
    try:
        # Check if frontend test script exists
        if not os.path.exists("frontend/test_frontend_auth.py"):
            print("❌ Frontend test script not found!")
            return False
        
        # Run frontend tests
        result = subprocess.run([
            sys.executable, 
            "frontend/test_frontend_auth.py"
        ], capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            print("✅ Frontend tests completed successfully")
            return True
        else:
            print("❌ Frontend tests failed")
            print("Error output:")
            print(result.stderr)
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Frontend tests timed out")
        return False
    except Exception as e:
        print(f"❌ Error running frontend tests: {e}")
        return False

def run_complete_tests():
    """Run complete system tests"""
    print("🔧🎨 Running Complete System Tests...")
    print("-" * 30)
    
    try:
        # Check if complete test script exists
        if not os.path.exists("test_complete_auth_system.py"):
            print("❌ Complete test script not found!")
            return False
        
        # Run complete tests
        result = subprocess.run([
            sys.executable, 
            "test_complete_auth_system.py"
        ], capture_output=True, text=True, timeout=600)
        
        if result.returncode == 0:
            print("✅ Complete system tests completed successfully")
            return True
        else:
            print("❌ Complete system tests failed")
            print("Error output:")
            print(result.stderr)
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Complete system tests timed out")
        return False
    except Exception as e:
        print(f"❌ Error running complete tests: {e}")
        return False

def quick_health_check():
    """Quick health check of the system"""
    print("🏥 Quick Health Check...")
    print("-" * 30)
    
    health_status = {}
    
    # Check backend
    try:
        import requests
        response = requests.get("http://localhost:8000/api/health/", timeout=5)
        health_status['backend'] = response.status_code == 200
        print(f"🔧 Backend: {'✅ Healthy' if health_status['backend'] else '❌ Unhealthy'}")
    except:
        health_status['backend'] = False
        print("🔧 Backend: ❌ Unreachable")
    
    # Check frontend
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        health_status['frontend'] = response.status_code == 200
        print(f"🎨 Frontend: {'✅ Healthy' if health_status['frontend'] else '❌ Unhealthy'}")
    except:
        health_status['frontend'] = False
        print("🎨 Frontend: ❌ Unreachable")
    
    # Overall health
    overall_health = all(health_status.values())
    print(f"\n🏥 Overall Health: {'✅ Healthy' if overall_health else '❌ Issues Found'}")
    
    return overall_health

def main():
    """Main function"""
    print_header()
    
    while True:
        print_menu()
        
        try:
            choice = input("Enter your choice (1-5): ").strip()
            
            if choice == '1':
                print("\n" + "=" * 50)
                run_backend_tests()
                print("=" * 50)
                
            elif choice == '2':
                print("\n" + "=" * 50)
                run_frontend_tests()
                print("=" * 50)
                
            elif choice == '3':
                print("\n" + "=" * 50)
                run_complete_tests()
                print("=" * 50)
                
            elif choice == '4':
                print("\n" + "=" * 50)
                quick_health_check()
                print("=" * 50)
                
            elif choice == '5':
                print("\n👋 Goodbye!")
                break
                
            else:
                print("❌ Invalid choice! Please enter 1-5.")
                
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # Ask if user wants to continue
        if choice != '5':
            input("\nPress Enter to continue...")

if __name__ == '__main__':
    main()
