#!/usr/bin/env python
"""
Enhanced Password Security Test Script
Tests password hashing with salting functionality
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
from nse_auth.users.auth import CustomAuthBackend, SecurityUtils, EnhancedPasswordHasher
from django.test import Client
from django.urls import reverse
import json
import hashlib
import secrets
import base64

User = get_user_model()

class EnhancedPasswordSecurityTestCase(TestCase):
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

    def test_password_hashing_with_salt(self):
        """Test password hashing with salt generation"""
        password = 'testpassword123'
        salt = SecurityUtils.generate_secure_password(32)
        
        # Hash password with salt
        hashed_password, returned_salt = SecurityUtils.hash_password_with_salt(password, salt)
        
        self.assertIsNotNone(hashed_password)
        self.assertIsNotNone(returned_salt)
        self.assertEqual(salt, returned_salt)
        
        # Verify password
        is_valid = SecurityUtils.verify_password_with_salt(password, hashed_password, salt)
        self.assertTrue(is_valid)
        
        # Test with wrong password
        is_invalid = SecurityUtils.verify_password_with_salt('wrongpassword', hashed_password, salt)
        self.assertFalse(is_invalid)

    def test_enhanced_password_hasher(self):
        """Test the enhanced password hasher"""
        password = 'testpassword123'
        salt = 'test_salt_value'
        
        hasher = EnhancedPasswordHasher()
        
        # Encode password
        encoded = hasher.encode(password, salt)
        self.assertIsNotNone(encoded)
        
        # Verify password
        is_valid = hasher.verify(password, encoded)
        self.assertTrue(is_valid)
        
        # Test with wrong password
        is_invalid = hasher.verify('wrongpassword', encoded)
        self.assertFalse(is_invalid)

    def test_custom_auth_backend(self):
        """Test custom authentication backend"""
        # Create user with salted password
        user_data = self.user_data.copy()
        user_data['password'] = 'testpass123'
        
        # Create user manually to test salt generation
        user = User.objects.create_user(
            email=user_data['email'],
            password=user_data['password'],
            first_name=user_data['first_name'],
            last_name=user_data['last_name']
        )
        
        # Generate salt for user
        salt = SecurityUtils.generate_secure_password(32)
        user.password_salt = salt
        user.save()
        
        # Hash password with salt
        hashed_password, _ = SecurityUtils.hash_password_with_salt('testpass123', salt)
        user.password = hashed_password
        user.save()
        
        # Test authentication
        authenticated_user = self.auth_backend.authenticate(
            None, 
            username='test@example.com', 
            password='testpass123'
        )
        
        self.assertIsNotNone(authenticated_user)
        self.assertEqual(authenticated_user.email, 'test@example.com')
        
        # Test with wrong password
        failed_auth = self.auth_backend.authenticate(
            None, 
            username='test@example.com', 
            password='wrongpassword'
        )
        
        self.assertIsNone(failed_auth)

    def test_user_registration_with_salt(self):
        """Test user registration with salted password"""
        response = self.client.post('/api/auth/register/', 
                                json.dumps(self.user_data),
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email='test@example.com').exists())
        
        # Check if user has salt
        user = User.objects.get(email='test@example.com')
        self.assertIsNotNone(user.password_salt)
        self.assertTrue(len(user.password_salt) > 0)
        
        # Check if profile was created
        self.assertTrue(UserProfile.objects.filter(user=user).exists())

    def test_login_with_salted_password(self):
        """Test login with salted password"""
        # Register user
        self.client.post('/api/auth/register/', 
                        json.dumps(self.user_data),
                        content_type='application/json')
        
        # Login
        login_data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post('/api/auth/login/', 
                                json.dumps(login_data),
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.json())
        self.assertIn('user', response.json())

    def test_password_salt_uniqueness(self):
        """Test that each user gets a unique salt"""
        # Create two users
        user1_data = self.user_data.copy()
        user1_data['email'] = 'user1@example.com'
        
        user2_data = self.user_data.copy()
        user2_data['email'] = 'user2@example.com'
        
        # Register both users
        self.client.post('/api/auth/register/', 
                        json.dumps(user1_data),
                        content_type='application/json')
        
        self.client.post('/api/auth/register/', 
                        json.dumps(user2_data),
                        content_type='application/json')
        
        # Check that salts are different
        user1 = User.objects.get(email='user1@example.com')
        user2 = User.objects.get(email='user2@example.com')
        
        self.assertNotEqual(user1.password_salt, user2.password_salt)

    def test_password_security_strength(self):
        """Test password security features"""
        # Test secure password generation
        secure_password = SecurityUtils.generate_secure_password()
        self.assertEqual(len(secure_password), 12)
        
        # Test custom length
        custom_length_password = SecurityUtils.generate_secure_password(16)
        self.assertEqual(len(custom_length_password), 16)
        
        # Test that generated passwords contain different characters
        passwords = [SecurityUtils.generate_secure_password() for _ in range(10)]
        unique_passwords = set(passwords)
        self.assertEqual(len(unique_passwords), 10)  # All passwords should be unique

    def test_login_attempt_tracking_with_salt(self):
        """Test login attempt tracking with salted passwords"""
        # Register user
        self.client.post('/api/auth/register/', 
                        json.dumps(self.user_data),
                        content_type='application/json')
        
        # Failed login attempt
        response = self.client.post('/api/auth/login/', 
                                json.dumps({
                                    'email': 'test@example.com',
                                    'password': 'wrongpassword'
                                }),
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 401)
        
        # Check if login attempt was logged
        self.assertTrue(LoginAttempt.objects.filter(
            email='test@example.com',
            success=False
        ).exists())

    def test_salt_storage_security(self):
        """Test that salts are stored securely"""
        # Create user
        user_data = self.user_data.copy()
        user_data['password'] = 'testpass123'
        
        self.client.post('/api/auth/register/', 
                        json.dumps(user_data),
                        content_type='application/json')
        
        # Check salt is stored
        user = User.objects.get(email='test@example.com')
        self.assertIsNotNone(user.password_salt)
        
        # Salt should be base64 encoded or URL safe
        try:
            # Try to decode as base64
            base64.b64decode(user.password_salt.encode('ascii'))
            salt_is_base64 = True
        except:
            salt_is_base64 = False
        
        # Salt should be URL safe (contains only URL-safe characters)
        is_url_safe = all(c.isalnum() or c in '-_' for c in user.password_salt)
        
        self.assertTrue(is_url_safe or salt_is_base64)

    def test_password_hash_consistency(self):
        """Test password hashing consistency"""
        password = 'testpassword123'
        salt = 'test_salt_value'
        
        # Hash password multiple times with same salt
        hasher = EnhancedPasswordHasher()
        hash1 = hasher.encode(password, salt)
        hash2 = hasher.encode(password, salt)
        
        # Hashes should be consistent
        self.assertEqual(hash1, hash2)
        
        # Verification should work for both
        self.assertTrue(hasher.verify(password, hash1))
        self.assertTrue(hasher.verify(password, hash2))

def run_enhanced_security_tests():
    """Run all enhanced security tests"""
    print("🔐 Running Enhanced Password Security Tests...")
    print("=" * 60)
    
    import unittest
    
    # Create test suite
    suite = unittest.TestLoader().loadTestsFromTestCase(EnhancedPasswordSecurityTestCase)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    if result.wasSuccessful():
        print("\n✅ All enhanced security tests passed!")
        print("\n🔐 Security Features Verified:")
        print("  • Password hashing with unique salts")
        print("  • Secure salt generation")
        print("  • Custom authentication backend")
        print("  • Password verification with salts")
        print("  • Login attempt tracking")
        print("  • Salt uniqueness per user")
        print("  • Password strength validation")
        print("  • Secure password storage")
        return True
    else:
        print(f"\n❌ {len(result.failures)} test(s) failed")
        print(f"❌ {len(result.errors)} error(s) occurred")
        return False

if __name__ == '__main__':
    run_enhanced_security_tests()
