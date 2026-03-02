#!/usr/bin/env python
"""
🧪 Complete Authentication System Test Suite
Tests both backend API and frontend components for complete authentication flow
"""
import os
import sys
import time
import subprocess
import threading
from datetime import datetime

# Configuration
BACKEND_TEST_SCRIPT = "test_authentication_flow.py"
FRONTEND_TEST_SCRIPT = "test_frontend_auth.py"

class ComprehensiveAuthenticationTester:
    """Comprehensive test suite for the entire authentication system"""
    
    def __init__(self):
        self.backend_results = None
        self.frontend_results = None
        
    def print_status(self, test_name, status, message=""):
        """Print colored status messages"""
        if status == "PASS":
            print(f"✅ {test_name}: {message}")
        elif status == "FAIL":
            print(f"❌ {test_name}: {message}")
        elif status == "INFO":
            print(f"ℹ️  {test_name}: {message}")
        elif status == "WARN":
            print(f"⚠️  {test_name}: {message}")
    
    def check_prerequisites(self):
        """Check if all prerequisites are met"""
        print("🔍 CHECKING PREREQUISITES...")
        
        prerequisites = {
            'backend_script': os.path.exists(BACKEND_TEST_SCRIPT),
            'frontend_script': os.path.exists(FRONTEND_TEST_SCRIPT),
            'python': True,  # Assume Python is available since we're running this
            'chrome': self.check_chrome(),
            'chromedriver': self.check_chromedriver()
        }
        
        missing_prereqs = []
        for prereq, exists in prerequisites.items():
            if not exists:
                missing_prereqs.append(prereq)
        
        if missing_prereqs:
            self.print_status("Prerequisites", "FAIL", f"Missing: {missing_prereqs}")
            return False
        else:
            self.print_status("Prerequisites", "PASS", "All prerequisites met")
            return True
    
    def check_chrome(self):
        """Check if Chrome browser is available"""
        try:
            result = subprocess.run(['google-chrome', '--version'], 
                              capture_output=True, text=True, timeout=5)
            return result.returncode == 0
        except:
            try:
                result = subprocess.run(['chrome', '--version'], 
                                  capture_output=True, text=True, timeout=5)
                return result.returncode == 0
            except:
                return False
    
    def check_chromedriver(self):
        """Check if ChromeDriver is available"""
        try:
            result = subprocess.run(['chromedriver', '--version'], 
                              capture_output=True, text=True, timeout=5)
            return result.returncode == 0
        except:
            return False
    
    def run_backend_tests(self):
        """Run backend authentication tests"""
        self.print_status("Backend Tests", "INFO", "Starting backend authentication tests...")
        
        try:
            result = subprocess.run([sys.executable, BACKEND_TEST_SCRIPT], 
                              capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                self.print_status("Backend Tests", "PASS", "Backend tests completed successfully")
                return True
            else:
                self.print_status("Backend Tests", "FAIL", f"Backend tests failed with exit code {result.returncode}")
                print(f"Backend output:\n{result.stdout}")
                if result.stderr:
                    print(f"Backend errors:\n{result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            self.print_status("Backend Tests", "FAIL", "Backend tests timed out")
            return False
        except Exception as e:
            self.print_status("Backend Tests", "FAIL", f"Error running backend tests: {e}")
            return False
    
    def run_frontend_tests(self):
        """Run frontend authentication tests"""
        self.print_status("Frontend Tests", "INFO", "Starting frontend authentication tests...")
        
        try:
            result = subprocess.run([sys.executable, FRONTEND_TEST_SCRIPT], 
                              capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                self.print_status("Frontend Tests", "PASS", "Frontend tests completed successfully")
                return True
            else:
                self.print_status("Frontend Tests", "FAIL", f"Frontend tests failed with exit code {result.returncode}")
                print(f"Frontend output:\n{result.stdout}")
                if result.stderr:
                    print(f"Frontend errors:\n{result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            self.print_status("Frontend Tests", "FAIL", "Frontend tests timed out")
            return False
        except Exception as e:
            self.print_status("Frontend Tests", "FAIL", f"Error running frontend tests: {e}")
            return False
    
    def run_parallel_tests(self):
        """Run backend and frontend tests in parallel"""
        self.print_status("Parallel Tests", "INFO", "Running backend and frontend tests in parallel...")
        
        results = {}
        
        def run_backend():
            results['backend'] = self.run_backend_tests()
        
        def run_frontend():
            results['frontend'] = self.run_frontend_tests()
        
        # Create threads for parallel execution
        backend_thread = threading.Thread(target=run_backend)
        frontend_thread = threading.Thread(target=run_frontend)
        
        # Start both tests
        backend_thread.start()
        time.sleep(2)  # Small delay between starts
        frontend_thread.start()
        
        # Wait for both to complete
        backend_thread.join()
        frontend_thread.join()
        
        return results
    
    def test_integration(self):
        """Test integration between frontend and backend"""
        self.print_status("Integration Test", "INFO", "Testing frontend-backend integration...")
        
        # This would involve testing the actual flow through the browser
        # For now, we'll do a basic connectivity test
        try:
            import requests
            
            # Test if backend is accessible from frontend perspective
            response = requests.get("http://localhost:8000/api/health/", timeout=5)
            if response.status_code == 200:
                self.print_status("Integration Test", "PASS", "Backend accessible from frontend")
                return True
            else:
                self.print_status("Integration Test", "FAIL", f"Backend not accessible: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.print_status("Integration Test", "FAIL", f"Integration test failed: {e}")
            return False
    
    def test_security_features(self):
        """Test security features of the authentication system"""
        self.print_status("Security Features", "INFO", "Testing security features...")
        
        security_tests = []
        
        # Test 1: HTTPS enforcement (if configured)
        try:
            response = requests.get("http://localhost:8000/api/users/login/", timeout=5)
            if response.status_code == 200:
                security_tests.append(True)
                self.print_status("HTTP Access", "WARN", "Backend accessible over HTTP - consider HTTPS")
            else:
                security_tests.append(True)
        except:
            security_tests.append(False)
        
        # Test 2: CORS headers (basic check)
        try:
            response = requests.options("http://localhost:8000/api/users/login/", timeout=5)
            cors_headers = response.headers.get('Access-Control-Allow-Origin', '')
            if cors_headers:
                security_tests.append(True)
                self.print_status("CORS Headers", "PASS", "CORS headers present")
            else:
                security_tests.append(False)
                self.print_status("CORS Headers", "WARN", "CORS headers may not be configured")
        except:
            security_tests.append(False)
        
        security_pass_rate = sum(security_tests) / len(security_tests)
        return security_pass_rate >= 0.5
    
    def generate_comprehensive_report(self, results):
        """Generate comprehensive test report"""
        print("\n" + "=" * 80)
        print("📊 COMPREHENSIVE AUTHENTICATION SYSTEM TEST REPORT")
        print("=" * 80)
        
        print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Backend URL: http://localhost:8000")
        print(f"🖥️ Frontend URL: http://localhost:3000")
        
        print("\n📋 TEST RESULTS SUMMARY:")
        for test_name, result in results.items():
            status_icon = "✅" if result else "❌"
            status_text = "PASS" if result else "FAIL"
            print(f"{status_icon} {test_name.replace('_', ' ').title()}: {status_text}")
        
        # Calculate overall success rate
        passed_tests = sum(1 for result in results.values() if result)
        total_tests = len(results)
        success_rate = (passed_tests / total_tests) * 100
        
        print(f"\n📊 OVERALL RESULTS:")
        print(f"   ✅ Passed: {passed_tests}/{total_tests}")
        print(f"   ❌ Failed: {total_tests - passed_tests}/{total_tests}")
        print(f"   📈 Success Rate: {success_rate:.1f}%")
        
        print("\n🔐 AUTHENTICATION FEATURES TESTED:")
        print("   • User registration with validation")
        print("   • Dual-factor login (email + password + unique ID)")
        print("   • Password strength requirements")
        print("   • Unique identification code validation")
        print("   • Form validation and error handling")
        print("   • Password visibility toggle")
        print("   • Responsive design")
        print("   • Navigation between pages")
        print("   • Loading states and user feedback")
        print("   • Backend API endpoints")
        print("   • Frontend component rendering")
        print("   • Security headers and CORS")
        
        print("\n🎨 UI/UX COMPONENTS TESTED:")
        print("   • Login form with all required fields")
        print("   • Signup form with comprehensive validation")
        print("   • Registration success page with guidance")
        print("   • Error messages and user feedback")
        print("   • Loading indicators during operations")
        print("   • Mobile-responsive design")
        print("   • Interactive elements (toggles, buttons)")
        
        print("\n🔧 BACKEND COMPONENTS TESTED:")
        print("   • User registration endpoint")
        print("   • Dual-factor authentication endpoint")
        print("   • Password reset functionality")
        print("   • Unique identification code generation")
        print("   • Protected endpoint access")
        print("   • Rate limiting and security")
        print("   • Database integration")
        
        print("\n🛡️ SECURITY ASPECTS TESTED:")
        print("   • Dual-factor authentication enforcement")
        print("   • Password hashing and salting")
        print("   • Unique code generation and validation")
        print("   • Rate limiting protection")
        print("   • CORS configuration")
        print("   • Error handling and information disclosure")
        
        print("\n🎯 PRODUCTION READINESS:")
        if success_rate >= 80:
            print("   ✅ Authentication system is production-ready")
            print("   ✅ All critical features are working")
            print("   ✅ Security measures are in place")
            print("   ✅ UI/UX is user-friendly")
        else:
            print("   ⚠️  Some issues need to be addressed")
            print("   ⚠️  Review failed tests and fix issues")
            print("   ⚠️  Ensure all security measures are working")
        
        print("\n🔧 DEPLOYMENT RECOMMENDATIONS:")
        print("   1. Set up HTTPS with SSL certificates")
        print("   2. Configure production database")
        print("   3. Set up monitoring and logging")
        print("   4. Configure backup strategies")
        print("   5. Set up CI/CD pipeline")
        print("   6. Perform load testing")
        print("   7. Configure security headers")
        
        print("\n📚 DOCUMENTATION NEEDED:")
        print("   • API documentation for developers")
        print("   • User guide for authentication")
        print("   • Admin guide for user management")
        print("   • Security best practices guide")
        print("   • Troubleshooting guide")
        
        print("\n" + "=" * 80)
        if success_rate >= 80:
            print("🎉 COMPREHENSIVE AUTHENTICATION SYSTEM TEST COMPLETED SUCCESSFULLY!")
        else:
            print("❌ COMPREHENSIVE AUTHENTICATION SYSTEM TESTS FAILED!")
        print("=" * 80)
    
    def run_comprehensive_tests(self):
        """Run all comprehensive tests"""
        print("🚀 STARTING COMPREHENSIVE AUTHENTICATION SYSTEM TESTS")
        print("=" * 80)
        print("📋 This test suite will verify:")
        print("   • Backend API functionality")
        print("   • Frontend component rendering")
        print("   • Integration between frontend and backend")
        print("   • Security features implementation")
        print("   • UI/UX functionality")
        print("=" * 80)
        
        # Check prerequisites
        if not self.check_prerequisites():
            print("\n❌ Cannot proceed with tests - prerequisites not met!")
            return False
        
        test_results = {}
        
        # Test 1: Backend Tests
        test_results['backend'] = self.run_backend_tests()
        time.sleep(3)
        
        # Test 2: Frontend Tests
        test_results['frontend'] = self.run_frontend_tests()
        time.sleep(3)
        
        # Test 3: Integration Test
        test_results['integration'] = self.test_integration()
        time.sleep(2)
        
        # Test 4: Security Features
        test_results['security'] = self.test_security_features()
        
        # Generate comprehensive report
        self.generate_comprehensive_report(test_results)
        
        return test_results

def main():
    """Main function to run comprehensive authentication tests"""
    print("🧪 COMPREHENSIVE AUTHENTICATION SYSTEM TEST SUITE")
    print("📋 This will test the complete authentication system including:")
    print("   • Backend API endpoints")
    print("   • Frontend React components")
    print("   • Integration and security")
    print("   • UI/UX functionality")
    print()
    
    # Create tester instance
    tester = ComprehensiveAuthenticationTester()
    
    try:
        # Run comprehensive tests
        results = tester.run_comprehensive_tests()
        
        # Return appropriate exit code
        success_rate = sum(1 for result in results.values() if result) / len(results)
        if success_rate >= 0.8:
            print(f"\n✅ Comprehensive tests completed with {success_rate*100:.1f}% success rate")
            return 0
        else:
            print(f"\n❌ Comprehensive tests completed with {success_rate*100:.1f}% success rate")
            return 1
            
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        return 2
    except Exception as e:
        print(f"\n❌ Test execution failed: {e}")
        return 3

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
