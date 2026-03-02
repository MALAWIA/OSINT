#!/usr/bin/env python
"""
Test script for Django authentication system
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
from django.test import Client
from django.urls import reverse
import json

User = get_user_model()

class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'phone_number': '+254712345678'
        }

    def test_user_registration(self):
        """Test user registration"""
        response = self.client.post('/api/auth/register/', 
                                json.dumps(self.user_data),
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(email='test@example.com').exists())
        
        # Check if profile was created
        user = User.objects.get(email='test@example.com')
        self.assertTrue(UserProfile.objects.filter(user=user).exists())

    def test_user_login(self):
        """Test user login"""
        # First register a user
        self.client.post('/api/auth/register/', 
                        json.dumps(self.user_data),
                        content_type='application/json')
        
        # Then login
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

    def test_invalid_login(self):
        """Test invalid login credentials"""
        response = self.client.post('/api/auth/login/', 
                                json.dumps({
                                    'email': 'test@example.com',
                                    'password': 'wrongpassword'
                                }),
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 401)
        self.assertIn('error', response.json())

    def test_logout(self):
        """Test logout functionality"""
        # Register and login user
        self.client.post('/api/auth/register/', 
                        json.dumps(self.user_data),
                        content_type='application/json')
        
        self.client.post('/api/auth/login/', 
                        json.dumps({
                            'email': 'test@example.com',
                            'password': 'testpass123'
                        }),
                        content_type='application/json')
        
        # Logout
        response = self.client.post('/api/auth/logout/', 
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.json())

    def test_profile_access(self):
        """Test profile access without login"""
        response = self.client.get('/api/auth/profile/', 
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 401)

    def test_profile_access_with_login(self):
        """Test profile access with login"""
        # Register and login user
        self.client.post('/api/auth/register/', 
                        json.dumps(self.user_data),
                        content_type='application/json')
        
        self.client.post('/api/auth/login/', 
                        json.dumps({
                            'email': 'test@example.com',
                            'password': 'testpass123'
                        }),
                        content_type='application/json')
        
        response = self.client.get('/api/auth/profile/', 
                               content_type='application/json')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('user', response.json())
        self.assertIn('profile', response.json())

    def test_login_attempt_tracking(self):
        """Test login attempt tracking"""
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

    def test_password_validation(self):
        """Test password validation during registration"""
        # Test short password
        short_password_data = self.user_data.copy()
        short_password_data['password'] = 'short'
        short_password_data['password_confirm'] = 'short'
        
        response = self.client.post('/api/auth/register/', 
                                json.dumps(short_password_data),
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        
        # Test password mismatch
        mismatch_data = self.user_data.copy()
        mismatch_data['password'] = 'testpass123'
        mismatch_data['password_confirm'] = 'different'
        
        response = self.client.post('/api/auth/register/', 
                                json.dumps(mismatch_data),
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 400)

    def test_email_validation(self):
        """Test email validation"""
        # Test invalid email format
        invalid_email_data = self.user_data.copy()
        invalid_email_data['email'] = 'invalid-email'
        
        response = self.client.post('/api/auth/register/', 
                                json.dumps(invalid_email_data),
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        
        # Test duplicate email
        self.client.post('/api/auth/register/', 
                        json.dumps(self.user_data),
                        content_type='application/json')
        
        duplicate_data = self.user_data.copy()
        duplicate_data['email'] = 'test@example.com'
        duplicate_data['first_name'] = 'Another'
        
        response = self.client.post('/api/auth/register/', 
                                json.dumps(duplicate_data),
                                content_type='application/json')
        
        self.assertEqual(response.status_code, 400)
        self.assertIn('A user with this email already exists', response.json()['error'])

if __name__ == '__main__':
    print("Running Django authentication tests...")
    import unittest
    unittest.main()
