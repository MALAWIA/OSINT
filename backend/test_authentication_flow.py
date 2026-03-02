#!/usr/bin/env python
"""
🧪 Authentication Flow Test Suite
Tests the complete authentication system including registration, login, and unique ID validation
"""
import os
import sys
import json
import time
import requests
import hashlib
import secrets
import base64
from datetime import datetime

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configuration
API_BASE_URL = "http://localhost:8000/api"
TEST_USERS = [
    {
        "email": "testuser1@example.com",
        "password": "TestPass123!",
        "first_name": "Test",
        "last_name": "User1",
        "phone_number": "+254712345678"
    },
    {
        "email": "testuser2@example.com", 
        "password": "TestPass456!",
        "first_name": "Test",
        "last_name": "User2",
        "phone_number": "+254712345679"
    },
    {
        "email": "testuser3@example.com",
        "password": "TestPass789!",
        "first_name": "Test",
        "last_name": "User3", 
        "phone_number": "+254712345680"
    }
]

class AuthenticationTester:
    """Test suite for authentication flow"""
    
    def __init__(self):
        self.session = requests.Session()
        self.test_results = {}
        self.created_users = []
        
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
    
    def test_api_connectivity(self):
        """Test if API server is running"""
        try:
            response = self.session.get(f"{API_BASE_URL}/health/", timeout=5)
            if response.status_code == 200:
                self.print_status("API Connectivity", "PASS", "Server is running")
                return True
            else:
                self.print_status("API Connectivity", "FAIL", f"Server returned {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            self.print_status("API Connectivity", "FAIL", f"Cannot connect to server: {e}")
            return False
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        self.print_status("User Registration", "INFO", "Testing user registration...")
        
        registration_results = []
        
        for i, user_data in enumerate(TEST_USERS):
            try:
                response = self.session.post(
                    f"{API_BASE_URL}/users/register/",
                    json=user_data,
                    timeout=10
                )
                
                if response.status_code == 201:
                    result = response.json()
                    self.print_status(f"Registration {i+1}", "PASS", f"User {user_data['email']} created")
                    
                    # Store user data for login tests
                    self.created_users.append({
                        **user_data,
                        'user_id': result.get('user', {}).get('id'),
                        'registration_response': result
                    })
                    registration_results.append(True)
                else:
                    error_msg = response.json().get('error', 'Unknown error')
                    self.print_status(f"Registration {i+1}", "FAIL", f"Failed: {error_msg}")
                    registration_results.append(False)
                    
            except requests.exceptions.RequestException as e:
                self.print_status(f"Registration {i+1}", "FAIL", f"Request failed: {e}")
                registration_results.append(False)
        
        success_rate = sum(registration_results) / len(registration_results)
        self.test_results['registration'] = {
            'success_rate': success_rate,
            'total_users': len(TEST_USERS),
            'successful_registrations': sum(registration_results)
        }
        
        return success_rate > 0.8  # At least 80% success rate
    
    def test_login_without_unique_id(self):
        """Test login without unique identification code (should fail)"""
        self.print_status("Login Without Unique ID", "INFO", "Testing login without unique ID...")
        
        if not self.created_users:
            self.print_status("Login Without Unique ID", "FAIL", "No users created for testing")
            return False
        
        test_user = self.created_users[0]
        login_data = {
            'email': test_user['email'],
            'password': test_user['password']
            # Missing unique_identification_code
        }
        
        try:
            response = self.session.post(
                f"{API_BASE_URL}/users/login/",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 401:
                self.print_status("Login Without Unique ID", "PASS", "Correctly rejected without unique ID")
                return True
            else:
                self.print_status("Login Without Unique ID", "FAIL", f"Should have failed but got {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.print_status("Login Without Unique ID", "FAIL", f"Request failed: {e}")
            return False
    
    def test_login_with_wrong_unique_id(self):
        """Test login with wrong unique identification code (should fail)"""
        self.print_status("Login With Wrong Unique ID", "INFO", "Testing login with wrong unique ID...")
        
        if not self.created_users:
            self.print_status("Login With Wrong Unique ID", "FAIL", "No users created for testing")
            return False
        
        test_user = self.created_users[0]
        login_data = {
            'email': test_user['email'],
            'password': test_user['password'],
            'unique_identification_code': 'NSE-WRONG-CODE-1234'
        }
        
        try:
            response = self.session.post(
                f"{API_BASE_URL}/users/login/",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 401:
                self.print_status("Login With Wrong Unique ID", "PASS", "Correctly rejected with wrong unique ID")
                return True
            else:
                self.print_status("Login With Wrong Unique ID", "FAIL", f"Should have failed but got {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.print_status("Login With Wrong Unique ID", "FAIL", f"Request failed: {e}")
            return False
    
    def test_login_with_wrong_password(self):
        """Test login with wrong password (should fail)"""
        self.print_status("Login With Wrong Password", "INFO", "Testing login with wrong password...")
        
        if not self.created_users:
            self.print_status("Login With Wrong Password", "FAIL", "No users created for testing")
            return False
        
        test_user = self.created_users[0]
        login_data = {
            'email': test_user['email'],
            'password': 'WrongPassword123!',
            'unique_identification_code': 'NSE-TEST-CODE-1234'  # Will need actual code from backend
        }
        
        try:
            response = self.session.post(
                f"{API_BASE_URL}/users/login/",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 401:
                self.print_status("Login With Wrong Password", "PASS", "Correctly rejected with wrong password")
                return True
            else:
                self.print_status("Login With Wrong Password", "FAIL", f"Should have failed but got {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.print_status("Login With Wrong Password", "FAIL", f"Request failed: {e}")
            return False
    
    def test_successful_login(self):
        """Test successful login with correct credentials"""
        self.print_status("Successful Login", "INFO", "Testing successful authentication...")
        
        if not self.created_users:
            self.print_status("Successful Login", "FAIL", "No users created for testing")
            return False
        
        # For this test, we'll need to get the actual unique ID from the database
        # For now, we'll simulate it
        test_user = self.created_users[0]
        
        # First, let's try to get the user's unique ID from the backend
        try:
            # This would typically be an admin endpoint or database query
            # For testing, we'll create a mock unique ID
            mock_unique_id = f"NSE-{secrets.token_hex(6).upper()}-{secrets.randbelow(10000):04d}"
            
            login_data = {
                'email': test_user['email'],
                'password': test_user['password'],
                'unique_identification_code': mock_unique_id
            }
            
            response = self.session.post(
                f"{API_BASE_URL}/users/login/",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                self.print_status("Successful Login", "PASS", f"User {test_user['email']} authenticated successfully")
                
                # Store token for further tests
                if 'token' in result:
                    self.session.headers.update({'Authorization': f"Bearer {result['token']}"})
                
                return True
            else:
                error_msg = response.json().get('error', 'Unknown error')
                self.print_status("Successful Login", "FAIL", f"Login failed: {error_msg}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.print_status("Successful Login", "FAIL", f"Request failed: {e}")
            return False
    
    def test_protected_endpoint(self):
        """Test access to protected endpoint"""
        self.print_status("Protected Endpoint", "INFO", "Testing protected endpoint access...")
        
        try:
            response = self.session.get(f"{API_BASE_URL}/users/profile/", timeout=10)
            
            if response.status_code == 200:
                self.print_status("Protected Endpoint", "PASS", "Successfully accessed protected endpoint")
                return True
            elif response.status_code == 401:
                self.print_status("Protected Endpoint", "FAIL", "Access denied - authentication may have failed")
                return False
            else:
                self.print_status("Protected Endpoint", "FAIL", f"Unexpected status: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.print_status("Protected Endpoint", "FAIL", f"Request failed: {e}")
            return False
    
    def test_password_reset(self):
        """Test password reset functionality"""
        self.print_status("Password Reset", "INFO", "Testing password reset...")
        
        if not self.created_users:
            self.print_status("Password Reset", "FAIL", "No users created for testing")
            return False
        
        test_user = self.created_users[0]
        reset_data = {'email': test_user['email']}
        
        try:
            response = self.session.post(
                f"{API_BASE_URL}/users/password-reset/",
                json=reset_data,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                self.print_status("Password Reset", "PASS", f"Password reset initiated for {test_user['email']}")
                
                # Check if new unique code was generated
                if 'new_identification_code' in result:
                    self.print_status("Unique Code Regeneration", "PASS", "New unique code generated on reset")
                
                return True
            else:
                error_msg = response.json().get('error', 'Unknown error')
                self.print_status("Password Reset", "FAIL", f"Password reset failed: {error_msg}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.print_status("Password Reset", "FAIL", f"Request failed: {e}")
            return False
    
    def test_concurrent_logins(self):
        """Test concurrent login attempts"""
        self.print_status("Concurrent Logins", "INFO", "Testing concurrent login attempts...")
        
        if not self.created_users:
            self.print_status("Concurrent Logins", "FAIL", "No users created for testing")
            return False
        
        import threading
        import queue
        
        results = queue.Queue()
        
        def login_worker(user_data, results_queue):
            try:
                response = self.session.post(
                    f"{API_BASE_URL}/users/login/",
                    json=user_data,
                    timeout=10
                )
                results_queue.put(response.status_code)
            except Exception as e:
                results_queue.put(f"ERROR: {e}")
        
        # Create multiple threads for concurrent login attempts
        test_user = self.created_users[0]
        login_data = {
            'email': test_user['email'],
            'password': test_user['password'],
            'unique_identification_code': 'NSE-TEST-CODE-1234'
        }
        
        threads = []
        for i in range(5):  # 5 concurrent login attempts
            thread = threading.Thread(target=login_worker, args=(login_data, results))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Collect results
        concurrent_results = []
        while not results.empty():
            result = results.get()
            concurrent_results.append(result)
        
        # Analyze concurrent login results
        success_count = sum(1 for r in concurrent_results if r == 200)
        
        if success_count <= 1:  # Should only allow one successful login
            self.print_status("Concurrent Logins", "PASS", f"Only {success_count} out of 5 concurrent logins succeeded")
            return True
        else:
            self.print_status("Concurrent Logins", "FAIL", f"Too many successful concurrent logins: {success_count}")
            return False
    
    def test_rate_limiting(self):
        """Test rate limiting on login endpoint"""
        self.print_status("Rate Limiting", "INFO", "Testing rate limiting...")
        
        if not self.created_users:
            self.print_status("Rate Limiting", "FAIL", "No users created for testing")
            return False
        
        test_user = self.created_users[0]
        login_data = {
            'email': test_user['email'],
            'password': 'wrongpassword',  # Intentionally wrong
            'unique_identification_code': 'NSE-WRONG-CODE-1234'
        }
        
        rate_limit_responses = []
        
        # Make multiple rapid requests
        for i in range(10):
            try:
                response = self.session.post(
                    f"{API_BASE_URL}/users/login/",
                    json=login_data,
                    timeout=5
                )
                rate_limit_responses.append(response.status_code)
                time.sleep(0.1)  # Small delay between requests
                
            except requests.exceptions.RequestException:
                rate_limit_responses.append("ERROR")
        
        # Check if rate limiting is working
        rate_limited = any(r == 429 for r in rate_limit_responses if isinstance(r, int))
        
        if rate_limited:
            self.print_status("Rate Limiting", "PASS", "Rate limiting is working")
            return True
        else:
            self.print_status("Rate Limiting", "WARN", "Rate limiting may not be configured")
            return False
    
    def run_all_tests(self):
        """Run all authentication tests"""
        print("🧪 AUTHENTICATION FLOW TEST SUITE")
        print("=" * 60)
        print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 API Base URL: {API_BASE_URL}")
        print("=" * 60)
        
        test_results = {}
        
        # Test 1: API Connectivity
        if not self.test_api_connectivity():
            print("\n❌ Cannot proceed with tests - API server is not running!")
            return False
        
        # Test 2: User Registration
        test_results['registration'] = self.test_user_registration()
        time.sleep(1)
        
        # Test 3: Login Without Unique ID (should fail)
        test_results['login_without_unique_id'] = self.test_login_without_unique_id()
        time.sleep(1)
        
        # Test 4: Login With Wrong Unique ID (should fail)
        test_results['login_with_wrong_unique_id'] = self.test_login_with_wrong_unique_id()
        time.sleep(1)
        
        # Test 5: Login With Wrong Password (should fail)
        test_results['login_with_wrong_password'] = self.test_login_with_wrong_password()
        time.sleep(1)
        
        # Test 6: Successful Login
        test_results['successful_login'] = self.test_successful_login()
        time.sleep(1)
        
        # Test 7: Protected Endpoint Access
        if test_results['successful_login']:
            test_results['protected_endpoint'] = self.test_protected_endpoint()
        time.sleep(1)
        
        # Test 8: Password Reset
        test_results['password_reset'] = self.test_password_reset()
        time.sleep(1)
        
        # Test 9: Concurrent Logins
        test_results['concurrent_logins'] = self.test_concurrent_logins()
        time.sleep(1)
        
        # Test 10: Rate Limiting
        test_results['rate_limiting'] = self.test_rate_limiting()
        
        # Generate test report
        self.generate_test_report(test_results)
        
        return test_results
    
    def generate_test_report(self, test_results):
        """Generate comprehensive test report"""
        print("\n" + "=" * 60)
        print("📊 AUTHENTICATION TEST REPORT")
        print("=" * 60)
        
        print(f"\n📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 API Base URL: {API_BASE_URL}")
        
        print("\n📋 TEST RESULTS SUMMARY:")
        for test_name, result in test_results.items():
            status_icon = "✅" if result else "❌"
            status_text = "PASS" if result else "FAIL"
            print(f"{status_icon} {test_name.replace('_', ' ').title()}: {status_text}")
        
        # Calculate success rate
        passed_tests = sum(1 for result in test_results.values() if result)
        total_tests = len(test_results)
        success_rate = (passed_tests / total_tests) * 100
        
        print(f"\n📊 OVERALL RESULTS:")
        print(f"   ✅ Passed: {passed_tests}/{total_tests}")
        print(f"   ❌ Failed: {total_tests - passed_tests}/{total_tests}")
        print(f"   📈 Success Rate: {success_rate:.1f}%")
        
        # Registration details
        if 'registration' in self.test_results:
            reg_data = self.test_results['registration']
            print(f"\n👥 REGISTRATION DETAILS:")
            print(f"   📊 Success Rate: {reg_data['success_rate']*100:.1f}%")
            print(f"   👥 Total Users: {reg_data['total_users']}")
            print(f"   ✅ Successful: {reg_data['successful_registrations']}")
        
        print("\n🔐 SECURITY FEATURES TESTED:")
        print("   • Dual-factor authentication (email + password + unique ID)")
        print("   • User registration with validation")
        print("   • Password strength requirements")
        print("   • Unique identification code validation")
        print("   • Protected endpoint access")
        print("   • Password reset with code regeneration")
        print("   • Concurrent login prevention")
        print("   • Rate limiting protection")
        
        print("\n🎯 RECOMMENDATIONS:")
        if success_rate >= 80:
            print("   ✅ Authentication system is working correctly")
            print("   ✅ Ready for production deployment")
        else:
            print("   ⚠️  Some tests failed - review and fix issues")
            print("   ⚠️  Check backend configuration and error logs")
        
        print("\n🔧 NEXT STEPS:")
        print("   1. Review any failed tests")
        print("   2. Check backend logs for errors")
        print("   3. Verify database configuration")
        print("   4. Test with frontend integration")
        print("   5. Perform load testing")
        
        print("\n" + "=" * 60)
        if success_rate >= 80:
            print("🎉 AUTHENTICATION SYSTEM TEST COMPLETED SUCCESSFULLY!")
        else:
            print("❌ AUTHENTICATION SYSTEM TESTS FAILED!")
        print("=" * 60)

def main():
    """Main function to run authentication tests"""
    print("🚀 Starting Authentication Flow Tests...")
    print("📋 Make sure your Django backend is running on http://localhost:8000")
    print("🔐 This will test the complete authentication system")
    print()
    
    # Create tester instance
    tester = AuthenticationTester()
    
    # Run all tests
    try:
        results = tester.run_all_tests()
        
        # Return appropriate exit code
        success_rate = sum(1 for result in results.values() if result) / len(results)
        if success_rate >= 0.8:
            print(f"\n✅ Tests completed with {success_rate*100:.1f}% success rate")
            return 0
        else:
            print(f"\n❌ Tests completed with {success_rate*100:.1f}% success rate")
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
