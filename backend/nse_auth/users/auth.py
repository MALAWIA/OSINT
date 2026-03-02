import hashlib
import secrets
import binascii
from django.contrib.auth.hashers import PBKDF2PasswordHasher
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import os
import base64

class EnhancedPasswordHasher:
    """Enhanced password hasher with salting"""
    
    def encode(self, password, salt):
        """Encode password with salt"""
        # Combine password and salt
        password_salt = (password + salt).encode('utf-8')
        # Hash the combined string
        hash_obj = hashlib.sha256(password_salt)
        # Return base64 encoded hash
        return base64.b64encode(hash_obj.digest()).decode('ascii')
    
    def verify(self, password, encoded):
        """Verify password against encoded hash"""
        # Decode the hash
        try:
            decoded_hash = base64.b64decode(encoded.encode('ascii'))
            # Extract salt from the hash (first 32 bytes)
            salt = decoded_hash[:32]
            # Hash the password with the extracted salt
            password_salt = (password + salt).encode('utf-8')
            hash_obj = hashlib.sha256(password_salt)
            # Compare with the decoded hash
            return hash_obj.digest() == decoded_hash
        except (ValueError, binascii.Error):
            return False

class CustomAuthBackend(BaseBackend):
    """Custom authentication backend with enhanced security and unique identification codes"""
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        """
        Authenticate a user with enhanced password validation.
        Unique identification code is optional for immediate login after signup.
        """
        if username is None or password is None:
            return None
        
        # Check if unique identification code is provided (optional)
        unique_code = kwargs.get('unique_identification_code')
        
        User = get_user_model()
        
        try:
            # Find user by email (username field is email)
            user = User.objects.get(email=username.lower())
        except User.DoesNotExist:
            return None
        
        # If unique identification code is provided, verify it
        if unique_code:
            if not IdentificationCodeManager.validate_code_for_user(unique_code, user):
                return None
        
        # Verify password using Django's standard password checking
        # This works with the password set by User.objects.create_user()
        from django.contrib.auth import authenticate as django_authenticate
        user = django_authenticate(username=username.lower(), password=password)
        if user:
            return user
        else:
            return None
    
    def generate_salt(self):
        """Generate a secure random salt"""
        return secrets.token_urlsafe(32)
    
    def verify_password_with_code(self, password, hashed_password, salt, provided_code, stored_code):
        """Verify password against hashed password with salt and unique identification code"""
        # First verify the unique identification code matches
        if provided_code != stored_code:
            return False
        
        # Then verify the password with the stored hash and salt
        hasher = EnhancedPasswordHasher()
        return hasher.verify(password, hashed_password)
    
    def set_password(self, password, user=None):
        """
        Set password with salting for enhanced security
        """
        if user is None:
            raise ValueError("User object is required")
        
        # Generate new salt for this password
        salt = self.generate_salt()
        
        # Hash password with salt
        hasher = PBKDF2PasswordHasher()
        hashed_password = hasher.encode(password, salt)
        
        # Store both hash and salt
        user.password = hashed_password
        user.save()
        
        # Update user profile with salt
        try:
            profile = user.profile
            profile.password_salt = salt
            profile.save()
        except UserProfile.DoesNotExist:
            UserProfile.objects.create(
                user=user,
                password_salt=salt
            )

class SecurityUtils:
    """Security utilities for enhanced password management"""
    
    @staticmethod
    def generate_secure_password(length=12):
        """Generate a secure random password"""
        characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:<>,.?/'
        return ''.join(secrets.choice(characters) for _ in range(length))
    
    @staticmethod
    def hash_password_with_salt(password, salt=None):
        """Hash password with optional salt"""
        if salt is None:
            salt = secrets.token_urlsafe(32)
        
        # Use PBKDF2 with salt
        hasher = PBKDF2PasswordHasher()
        return hasher.encode(password, salt), salt
    
    @staticmethod
    def verify_password_with_salt(password, hashed_password, salt):
        """Verify password against hashed password with salt"""
        hasher = EnhancedPasswordHasher()
        return hasher.verify(password, hashed_password)
    
    @staticmethod
    def generate_verification_token():
        """Generate email verification token"""
        return secrets.token_urlsafe(32)
