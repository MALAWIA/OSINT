#!/usr/bin/env python
"""
Unique Identification Code System Test Suite
Tests the unique identification code generation, validation, and authentication
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nse_auth.settings')
django.setup()

from django.test import TestCase
from django.contrib.auth import get_user_model
from nse_auth.users.models import UserProfile, LoginAttempt
from nse_auth.users.auth import CustomAuthBackend, SecurityUtils
from nse_auth.users.identification_code import (
    UniqueIdentificationCodeGenerator, 
    IdentificationCodeManager, 
    CodeSecurityValidator
)
from nse_auth.users.serializers import UserRegistrationSerializer, UserLoginSerializer, PasswordResetSerializer
from django.test import Client
from django.urls import reverse
import json
import hashlib
import secrets
import base64

User = get_user_model()

class UniqueIdentificationCodeTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.auth_backend = CustomAuthBackend()
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'phone_number': '+254712345678'
        }

    def test_unique_code_generation(self):
        """Test unique identification code generation"""
        code = UniqueIdentificationCodeGenerator.generate_unique_code()
        
        # Check format
        self.assertTrue(UniqueIdentificationCodeGenerator.validate_code_format(code))
        
        # Check prefix
        self.assertTrue(code.startswith('NSE-'))
        
        # Check length
        parts = code.split('-')
        self.assertEqual(len(parts), 3)
        self.assertEqual(len(parts[1]), 12)  # alphanumeric part
        self.assertEqual(len(parts[2]), 4)     # numeric part
        
        # Test uniqueness
        code2 = UniqueIdentificationCodeGenerator.generate_unique_code()
        self.assertNotEqual(code, code2)

    def test_code_validation(self):
        """Test code validation"""
        # Valid code
        valid_code = "NSE-A7B3K9M2C4D8-1234"
        self.assertTrue(UniqueIdentificationCodeGenerator.validate_code_format(valid_code))
        
        # Invalid codes
        invalid_codes = [
            "INVALID-CODE",
            "NSE-TOO-SHORT-123",
            "NSE-TOO-LONG-12345",
            "NSE-INVALID-1234",
            "NSE-VALID-ABCD",
            "NSE-VALID-12345"
        ]
        
        for invalid_code in invalid_codes:
            self.assertFalse(UniqueIdentificationCodeGenerator.validate_code_format(invalid_code))

    def test_code_uniqueness(self):
        """Test code uniqueness in database"""
        # Generate multiple codes
        codes = [UniqueIdentificationCodeGenerator.generate_unique_code() for _ in range(10)]
        unique_codes = set(codes)
        
        # All should be unique
        self.assertEqual(len(unique_codes), 10)

    def test_user_registration_with_unique_code(self):
        """Test user registration with unique identification code"""
        response = self.client.post('/api/users/register/', 
                                json.dumps(self.user_data),
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email='test@example.com').exists())
        
        # Check if user has unique identification code
        user = User.objects.get(email='test@example.com')
        self.assertIsNotNone(user.unique_identification_code)
        self.assertTrue(UniqueIdentificationCodeGenerator.validate_code_format(user.unique_identification_code))

    def test_login_with_unique_code(self):
        """Test login with unique identification code and password"""
        # Register user first
        response = self.client.post('/api/users/register/', 
                                json.dumps(self.user_data),
                                content_type='application/json')
        
        user = User.objects.get(email='test@example.com')
        unique_code = user.unique_identification_code
        
        # Test successful login
        login_data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'unique_identification_code': unique_code
        }
        
        response = self.client.post('/api/users/login/', 
                                json.dumps(login_data),
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.json())
        self.assertIn('user', response.json())

    def test_login_with_wrong_code(self):
        """Test login with wrong unique identification code"""
        # Register user first
        self.client.post('/api/users/register/', 
                        json.dumps(self.user_data),
                        content_type='application/json')
        
        user = User.objects.get(email='test@example.com')
        
        # Test login with wrong code
        login_data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'unique_identification_code': 'NSE-WRONG-CODE-1234'
        }
        
        response = self.client.post('/api/users/login/', 
                                json.dumps(login_data),
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 401)
        self.assertIn('error', response.json())

    def test_login_with_wrong_password(self):
        """Test login with wrong password"""
        # Register user first
        self.client.post('/api/users/register/', 
                        json.dumps(self.user_data),
                        content_type='application/json')
        
        user = User.objects.get(email='test@example.com')
        unique_code = user.unique_identification_code
        
        # Test login with wrong password
        login_data = {
            'email': 'test@example.com',
            'password': 'wrongpassword',
            'unique_identification_code': unique_code
        }
        
        response = self.client.post('/api/users/login/', 
                                json.dumps(login_data),
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 401)
        self.assertIn('error', response.json())

    def test_password_reset_with_code_regeneration(self):
        """Test password reset with unique identification code regeneration"""
        # Register user first
        self.client.post('/api/users/register/', 
                        json.dumps(self.user_data),
                        content_type='application/json')
        
        user = User.objects.get(email='test@example.com')
        original_code = user.unique_identification_code
        
        # Initiate password reset
        reset_data = {'email': 'test@example.com'}
        response = self.client.post('/api/users/password-reset/', 
                                json.dumps(reset_data),
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('new_identification_code', response.json())
        
        # Check that code was regenerated
        user.refresh_from_db()
        self.assertNotEqual(user.unique_identification_code, original_code)
        self.assertTrue(UniqueIdentificationCodeGenerator.validate_code_format(user.unique_identification_code))

    def test_code_password_coupling(self):
        """Test that code and password are tightly coupled"""
        # Register user
        self.client.post('/api/users/register/', 
                        json.dumps(self.user_data),
                        content_type='application/json')
        
        user = User.objects.get(email='test@example.com')
        unique_code = user.unique_identification_code
        
        # Test that both code and password must match
        auth_backend = CustomAuthBackend()
        
        # Correct code and password
        authenticated_user = auth_backend.authenticate(
            None, 
            username='test@example.com', 
            password='testpass123',
            unique_identification_code=unique_code
        )
        self.assertIsNotNone(authenticated_user)
        self.assertEqual(authenticated_user.email, 'test@example.com')
        
        # Wrong code, correct password
        failed_auth = auth_backend.authenticate(
            None, 
            username='test@example.com', 
            password='testpass123',
            unique_identification_code='NSE-WRONG-CODE-1234'
        )
        self.assertIsNone(failed_auth)
        
        # Correct code, wrong password
        failed_auth = auth_backend.authenticate(
            None, 
            username='test@example.com', 
            password='wrongpassword',
            unique_identification_code=unique_code
        )
        self.assertIsNone(failed_auth)

    def test_code_security_validation(self):
        """Test code security validation"""
        # Test valid code
        valid_code = "NSE-A7B3K9M2C4D8-1234"
        result = CodeSecurityValidator.validate_code_security(valid_code)
        
        self.assertTrue(result['is_valid_format'])
        self.assertTrue(result['is_secure'])
        self.assertGreater(result['entropy_score'], 0.5)
        
        # Test weak code
        weak_code = "NSE-AAAAAAAAAAAA-1111"
        result = CodeSecurityValidator.validate_code_security(weak_code)
        
        self.assertTrue(result['is_valid_format'])
        self.assertFalse(result['is_secure'])
        self.assertLessThan(result['entropy_score'], 0.3)

    def test_login_attempt_tracking_with_unique_code(self):
        """Test login attempt tracking with unique identification codes"""
        # Register user
        self.client.post('/api/users/register/', 
                        json.dumps(self.user_data),
                        content_type='application/json')
        
        # Failed login attempt with wrong code
        login_data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'unique_identification_code': 'NSE-WRONG-CODE-1234'
        }
        
        response = self.client.post('/api/users/login/', 
                                json.dumps(login_data),
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 401)
        
        # Check if login attempt was logged
        self.assertTrue(LoginAttempt.objects.filter(
            email='test@example.com',
            success=False
        ).exists())

    def test_code_display_masking(self):
        """Test code display masking for admin purposes"""
        code = "NSE-A7B3K9M2C4D8-1234"
        
        # Test masked display
        masked_code = UniqueIdentificationCodeGenerator.generate_code_display(code, masked=True)
        self.assertIn('*', masked_code)
        self.assertNotEqual(masked_code, code)
        
        # Test unmasked display
        unmasked_code = UniqueIdentificationCodeGenerator.generate_code_display(code, masked=False)
        self.assertEqual(unmasked_code, code)

    def test_multiple_users_unique_codes(self):
        """Test that multiple users get unique codes"""
        users_data = [
            {
                'email': 'user1@example.com',
                'password': 'password123',
                'first_name': 'User',
                'last_name': 'One'
            },
            {
                'email': 'user2@example.com',
                'password': 'password456',
                'first_name': 'User',
                'last_name': 'Two'
            },
            {
                'email': 'user3@example.com',
                'password': 'password789',
                'first_name': 'User',
                'last_name': 'three'
            }
        ]
        
        created_users = []
        for user_data in users_data:
            response = self.client.post('/api/users/register/', 
                                    json.dumps(user_data),
                                    content_type='application/json')
            
            self.assertEqual(response.status_code, 201)
            created_users.append(response.json()['user']['email'])
        
        # Check that all users have unique codes
        for email in created_users:
            user = User.objects.get(email=email)
            self.assertIsNotNone(user.unique_identification_code)
        
        # Verify all codes are unique
        codes = [User.objects.get(email=email).unique_identification_code for email in created_users]
        unique_codes = set(codes)
        self.assertEqual(len(unique_codes), len(codes))

    def test_code_regeneration_on_password_change(self):
        """Test that code is regenerated when password is changed"""
        # Register user
        self.client.post('/api/users/register/', 
                        json.dumps(self.user_data),
                        content_type='application/json')
        
        user = User.objects.get(email='test@example.com')
        original_code = user.unique_identification_code
        
        # Simulate password change (regenerates code)
        IdentificationCodeManager.regenerate_user_code(user)
        
        # Check that code was regenerated
        user.refresh_from_db()
        self.assertNotEqual(user.unique_identification_code, original_code)
        self.assertTrue(UniqueIdentificationCodeGenerator.validate_code_format(user.unique_identification_code))

    def test_code_format_consistency(self):
        """Test that code format is consistent across generations"""
        codes = [UniqueIdentificationCodeGenerator.generate_unique_code() for _ in range(100)]
        
        for code in codes:
            self.assertTrue(UniqueIdentificationCodeGenerator.generate_unique_code_with_retry(exclude_user_id=None))
            self.assertTrue(UniqueIdentificationCodeGenerator.validate_code_format(code))
            
            parts = code.split('-')
            self.assertEqual(len(parts), 3)
            self.assertEqual(parts[0], 'NSE')
            self.assertEqual(len(parts[1]), 12)
            self.assertEqual(len(parts[2]), 4)
            self.assertTrue(parts[1].isalnum())
            self.assertTrue(parts[2].isdigit())

    def test_database_indexing(self):
        """Test that unique identification codes are properly indexed"""
        # Create user with unique code
        self.client.post('/api/users/register/', 
                        json.dumps(self.user_data),
                        content_type='application/json')
        
        user = User.objects.get(email='test@example.com')
        unique_code = user.unique_identification_code
        
        # Test database query by unique code
        try:
            found_user = User.objects.get(unique_identification_code=unique_code)
            self.assertEqual(found_user.email, 'test@example.com')
        except User.DoesNotExist:
            self.fail("Unique identification code not found in database")

def run_unique_id_tests():
    """Run all unique identification code tests"""
    print("🔐 Running Unique Identification Code Tests...")
    print("=" * 60)
    
    import unittest
    
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(UniqueIdentificationCodeTestCase)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    if result.wasSuccessful():
        print("\n✅ All unique identification code tests passed!")
        print("\n🔐 Features Verified:")
        print("  • Unique code generation")
        print("  • Code format validation")
        print("  • Code uniqueness")
        print("  • User registration with unique codes")
        print("  • Login with code and password coupling")
        print("  • Password reset with code regeneration")
        print("  • Code security validation")
        print("  • Login attempt tracking")
        print("  • Code display masking")
        print("  • Multiple users with unique codes")
        print("  • Code regeneration on password change")
        print("  • Database indexing")
        print("  • Code format consistency")
        return True
    else:
        print(f"\n❌ {len(result.failures)} test(s) failed")
        print(f"❌ {len(result.errors)} error(s) occurred")
        return False

if __name__ == '__main__':
    run_unique_id_tests()
