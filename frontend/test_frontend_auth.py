#!/usr/bin/env python
"""
🧪 Frontend Authentication Test Suite
Tests the React frontend authentication components
"""
import os
import sys
import time
import subprocess
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Configuration
FRONTEND_URL = "http://localhost:3000"
API_BASE_URL = "http://localhost:8000/api"

class FrontendAuthenticationTester:
    """Test suite for frontend authentication components"""
    
    def __init__(self):
        self.driver = None
        self.test_results = {}
        self.setup_driver()
        
    def setup_driver(self):
        """Setup Chrome WebDriver"""
        try:
            chrome_options = Options()
            chrome_options.add_argument("--headless")  # Run in headless mode
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--window-size=1920,1080")
            
            self.driver = webdriver.Chrome(options=chrome_options)
            print("✅ Chrome WebDriver initialized successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to initialize Chrome WebDriver: {e}")
            return False
    
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
    
    def test_frontend_accessibility(self):
        """Test if frontend is accessible"""
        try:
            self.driver.get(f"{FRONTEND_URL}/login")
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            page_title = self.driver.title
            if "Login" in page_title or "Sign in" in page_title:
                self.print_status("Frontend Accessibility", "PASS", "Login page loaded successfully")
                return True
            else:
                self.print_status("Frontend Accessibility", "FAIL", f"Unexpected page title: {page_title}")
                return False
                
        except TimeoutException:
            self.print_status("Frontend Accessibility", "FAIL", "Login page failed to load")
            return False
        except Exception as e:
            self.print_status("Frontend Accessibility", "FAIL", f"Error accessing frontend: {e}")
            return False
    
    def test_signup_form_elements(self):
        """Test signup form elements are present"""
        try:
            self.driver.get(f"{FRONTEND_URL}/signup")
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Check for form elements
            form_elements = {
                'first_name': 'input[name="first_name"]',
                'last_name': 'input[name="last_name"]',
                'email': 'input[name="email"]',
                'phone_number': 'input[name="phone_number"]',
                'password': 'input[name="password"]',
                'confirmPassword': 'input[name="confirmPassword"]',
                'submit_button': 'button[type="submit"]'
            }
            
            missing_elements = []
            
            for element_name, selector in form_elements.items():
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if not element.is_displayed():
                        missing_elements.append(element_name)
                except NoSuchElementException:
                    missing_elements.append(element_name)
            
            if not missing_elements:
                self.print_status("Signup Form Elements", "PASS", "All signup form elements present")
                return True
            else:
                self.print_status("Signup Form Elements", "FAIL", f"Missing elements: {missing_elements}")
                return False
                
        except Exception as e:
            self.print_status("Signup Form Elements", "FAIL", f"Error checking form: {e}")
            return False
    
    def test_login_form_elements(self):
        """Test login form elements are present"""
        try:
            self.driver.get(f"{FRONTEND_URL}/login")
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Check for form elements
            form_elements = {
                'email': 'input[name="email"]',
                'password': 'input[name="password"]',
                'unique_identification_code': 'input[name="unique_identification_code"]',
                'submit_button': 'button[type="submit"]'
            }
            
            missing_elements = []
            
            for element_name, selector in form_elements.items():
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if not element.is_displayed():
                        missing_elements.append(element_name)
                except NoSuchElementException:
                    missing_elements.append(element_name)
            
            if not missing_elements:
                self.print_status("Login Form Elements", "PASS", "All login form elements present")
                return True
            else:
                self.print_status("Login Form Elements", "FAIL", f"Missing elements: {missing_elements}")
                return False
                
        except Exception as e:
            self.print_status("Login Form Elements", "FAIL", f"Error checking form: {e}")
            return False
    
    def test_form_validation(self):
        """Test form validation functionality"""
        try:
            self.driver.get(f"{FRONTEND_URL}/signup")
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Test empty form submission
            submit_button = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
            submit_button.click()
            
            # Wait for validation messages
            time.sleep(2)
            
            # Check for error messages
            error_elements = self.driver.find_elements(By.CSS_SELECTOR, '.text-red-600')
            
            if len(error_elements) > 0:
                self.print_status("Form Validation", "PASS", f"Form validation working - {len(error_elements)} errors found")
                return True
            else:
                self.print_status("Form Validation", "WARN", "No validation errors displayed")
                return False
                
        except Exception as e:
            self.print_status("Form Validation", "FAIL", f"Error testing validation: {e}")
            return False
    
    def test_password_visibility_toggle(self):
        """Test password visibility toggle functionality"""
        try:
            self.driver.get(f"{FRONTEND_URL}/login")
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Find password field
            password_field = self.driver.find_element(By.CSS_SELECTOR, 'input[name="password"]')
            initial_type = password_field.get_attribute('type')
            
            # Find and click visibility toggle button
            toggle_button = self.driver.find_element(By.CSS_SELECTOR, 'button[onclick*="showPassword"]')
            toggle_button.click()
            
            # Check if password type changed
            new_type = password_field.get_attribute('type')
            
            if initial_type == 'password' and new_type == 'text':
                self.print_status("Password Visibility Toggle", "PASS", "Password visibility toggle working")
                return True
            elif initial_type == 'text' and new_type == 'password':
                self.print_status("Password Visibility Toggle", "PASS", "Password visibility toggle working")
                return True
            else:
                self.print_status("Password Visibility Toggle", "FAIL", f"Type did not change: {initial_type} -> {new_type}")
                return False
                
        except Exception as e:
            self.print_status("Password Visibility Toggle", "FAIL", f"Error testing toggle: {e}")
            return False
    
    def test_responsive_design(self):
        """Test responsive design at different screen sizes"""
        try:
            screen_sizes = [
                (1920, 1080, "Desktop"),
                (768, 1024, "Tablet"),
                (375, 667, "Mobile")
            ]
            
            responsive_results = []
            
            for width, height, device_name in screen_sizes:
                self.driver.set_window_size(width, height)
                self.driver.get(f"{FRONTEND_URL}/login")
                
                try:
                    WebDriverWait(self.driver, 5).until(
                        EC.presence_of_element_located((By.TAG_NAME, "body"))
                    )
                    
                    # Check if form is properly sized for viewport
                    form_container = self.driver.find_element(By.CSS_SELECTOR, '.max-w-md')
                    container_width = form_container.size['width']
                    
                    # For mobile, form should take full width
                    if device_name == "Mobile":
                        if container_width >= width * 0.9:  # At least 90% of viewport
                            responsive_results.append(True)
                        else:
                            responsive_results.append(False)
                    else:
                        responsive_results.append(True)
                        
                except Exception:
                    responsive_results.append(False)
            
            success_rate = sum(responsive_results) / len(responsive_results)
            
            if success_rate >= 0.8:
                self.print_status("Responsive Design", "PASS", f"Responsive design working ({success_rate*100:.1f}% success)")
                return True
            else:
                self.print_status("Responsive Design", "FAIL", f"Responsive design issues ({success_rate*100:.1f}% success)")
                return False
                
        except Exception as e:
            self.print_status("Responsive Design", "FAIL", f"Error testing responsive design: {e}")
            return False
    
    def test_navigation_links(self):
        """Test navigation between pages"""
        try:
            self.driver.get(f"{FRONTEND_URL}/login")
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Test navigation to signup
            try:
                signup_link = self.driver.find_element(By.LINK_TEXT, "create a new account")
                signup_link.click()
                
                WebDriverWait(self.driver, 5).until(
                    EC.url_contains("/signup")
                )
                
                current_url = self.driver.current_url
                if "/signup" in current_url:
                    self.print_status("Navigation Links", "PASS", "Navigation to signup working")
                else:
                    self.print_status("Navigation Links", "FAIL", f"Navigation failed - current URL: {current_url}")
                    return False
                    
            except Exception:
                self.print_status("Navigation Links", "FAIL", "Signup link not found or not clickable")
                return False
                
        except Exception as e:
            self.print_status("Navigation Links", "FAIL", f"Error testing navigation: {e}")
            return False
    
    def test_error_handling(self):
        """Test error handling and display"""
        try:
            self.driver.get(f"{FRONTEND_URL}/login")
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Fill form with invalid data
            email_field = self.driver.find_element(By.CSS_SELECTOR, 'input[name="email"]')
            password_field = self.driver.find_element(By.CSS_SELECTOR, 'input[name="password"]')
            unique_id_field = self.driver.find_element(By.CSS_SELECTOR, 'input[name="unique_identification_code"]')
            
            email_field.send_keys("invalid-email")
            password_field.send_keys("short")
            unique_id_field.send_keys("wrong")
            
            # Submit form
            submit_button = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
            submit_button.click()
            
            # Wait for error messages
            time.sleep(3)
            
            # Check for error display
            error_elements = self.driver.find_elements(By.CSS_SELECTOR, '.bg-red-50, .text-red-600')
            
            if len(error_elements) > 0:
                self.print_status("Error Handling", "PASS", f"Error messages displayed: {len(error_elements)} elements")
                return True
            else:
                self.print_status("Error Handling", "FAIL", "No error messages displayed for invalid input")
                return False
                
        except Exception as e:
            self.print_status("Error Handling", "FAIL", f"Error testing error handling: {e}")
            return False
    
    def test_loading_states(self):
        """Test loading states during form submission"""
        try:
            self.driver.get(f"{FRONTEND_URL}/signup")
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Fill form with valid data
            form_data = {
                'first_name': 'Test',
                'last_name': 'User',
                'email': 'test@example.com',
                'phone_number': '+254712345678',
                'password': 'TestPass123!',
                'confirmPassword': 'TestPass123!'
            }
            
            for field_name, value in form_data.items():
                if field_name != 'confirmPassword':  # Skip confirm password for now
                    field = self.driver.find_element(By.CSS_SELECTOR, f'input[name="{field_name}"]')
                    field.send_keys(value)
            
            # Submit form and check for loading state
            submit_button = self.driver.find_element(By.CSS_SELECTOR, 'button[type="submit"]')
            submit_button.click()
            
            # Check for loading spinner or disabled button
            time.sleep(2)
            
            loading_indicators = self.driver.find_elements(By.CSS_SELECTOR, '.animate-spin, [disabled]')
            
            if len(loading_indicators) > 0:
                self.print_status("Loading States", "PASS", "Loading indicators displayed during submission")
                return True
            else:
                self.print_status("Loading States", "WARN", "No loading indicators found")
                return False
                
        except Exception as e:
            self.print_status("Loading States", "FAIL", f"Error testing loading states: {e}")
            return False
    
    def run_all_tests(self):
        """Run all frontend tests"""
        print("🧪 FRONTEND AUTHENTICATION TEST SUITE")
        print("=" * 60)
        print(f"📅 Test Date: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Frontend URL: {FRONTEND_URL}")
        print(f"🔗 Backend API: {API_BASE_URL}")
        print("=" * 60)
        
        test_results = {}
        
        # Test 1: Frontend Accessibility
        test_results['accessibility'] = self.test_frontend_accessibility()
        time.sleep(2)
        
        # Test 2: Signup Form Elements
        test_results['signup_elements'] = self.test_signup_form_elements()
        time.sleep(2)
        
        # Test 3: Login Form Elements
        test_results['login_elements'] = self.test_login_form_elements()
        time.sleep(2)
        
        # Test 4: Form Validation
        test_results['form_validation'] = self.test_form_validation()
        time.sleep(2)
        
        # Test 5: Password Visibility Toggle
        test_results['password_toggle'] = self.test_password_visibility_toggle()
        time.sleep(2)
        
        # Test 6: Responsive Design
        test_results['responsive_design'] = self.test_responsive_design()
        time.sleep(2)
        
        # Test 7: Navigation Links
        test_results['navigation'] = self.test_navigation_links()
        time.sleep(2)
        
        # Test 8: Error Handling
        test_results['error_handling'] = self.test_error_handling()
        time.sleep(2)
        
        # Test 9: Loading States
        test_results['loading_states'] = self.test_loading_states()
        
        # Generate test report
        self.generate_test_report(test_results)
        
        return test_results
    
    def generate_test_report(self, test_results):
        """Generate comprehensive test report"""
        print("\n" + "=" * 60)
        print("📊 FRONTEND AUTHENTICATION TEST REPORT")
        print("=" * 60)
        
        print(f"\n📅 Test Date: {time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Frontend URL: {FRONTEND_URL}")
        
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
        
        print("\n🎨 UI/UX FEATURES TESTED:")
        print("   • Form accessibility and element presence")
        print("   • Form validation with error messages")
        print("   • Password visibility toggle functionality")
        print("   • Responsive design for multiple screen sizes")
        print("   • Navigation between authentication pages")
        print("   • Error handling and user feedback")
        print("   • Loading states during form submission")
        
        print("\n🔧 TECHNICAL ASPECTS TESTED:")
        print("   • React component rendering")
        print("   • CSS styling with Tailwind")
        print("   • JavaScript event handling")
        print("   • Form validation logic")
        print("   • Responsive breakpoints")
        print("   • User interaction feedback")
        
        print("\n🎯 RECOMMENDATIONS:")
        if success_rate >= 80:
            print("   ✅ Frontend authentication is working correctly")
            print("   ✅ UI/UX features are properly implemented")
            print("   ✅ Ready for integration with backend")
        else:
            print("   ⚠️  Some tests failed - review frontend implementation")
            print("   ⚠️  Check browser console for JavaScript errors")
            print("   ⚠️  Verify Tailwind CSS is properly loaded")
        
        print("\n🔧 NEXT STEPS:")
        print("   1. Fix any failed UI tests")
        print("   2. Test integration with backend API")
        print("   3. Perform cross-browser testing")
        print("   4. Test on actual mobile devices")
        print("   5. Verify accessibility standards")
        
        print("\n" + "=" * 60)
        if success_rate >= 80:
            print("🎉 FRONTEND AUTHENTICATION TEST COMPLETED SUCCESSFULLY!")
        else:
            print("❌ FRONTEND AUTHENTICATION TESTS FAILED!")
        print("=" * 60)
    
    def cleanup(self):
        """Clean up resources"""
        if self.driver:
            self.driver.quit()
            print("✅ WebDriver cleaned up")

def main():
    """Main function to run frontend authentication tests"""
    print("🚀 Starting Frontend Authentication Tests...")
    print("📋 Make sure:")
    print("   1. React frontend is running on http://localhost:3000")
    print("   2. Chrome browser is installed")
    print("   3. ChromeDriver is available")
    print("   4. Backend API is running on http://localhost:8000")
    print()
    
    # Create tester instance
    tester = FrontendAuthenticationTester()
    
    try:
        # Run all tests
        results = tester.run_all_tests()
        
        # Return appropriate exit code
        success_rate = sum(1 for result in results.values() if result) / len(results)
        if success_rate >= 0.8:
            print(f"\n✅ Tests completed with {success_rate*100:.1f}% success rate")
            exit_code = 0
        else:
            print(f"\n❌ Tests completed with {success_rate*100:.1f}% success rate")
            exit_code = 1
            
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        exit_code = 2
    except Exception as e:
        print(f"\n❌ Test execution failed: {e}")
        exit_code = 3
    finally:
        tester.cleanup()
    
    return exit_code

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
