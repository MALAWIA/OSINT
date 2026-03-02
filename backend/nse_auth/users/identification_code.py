import secrets
import string
import hashlib
import time
from django.core.exceptions import ValidationError
from django.utils import timezone
from typing import Optional, Tuple

class UniqueIdentificationCodeGenerator:
    """
    Generates and manages unique identification codes for users.
    These codes are completely abstracted from users and tightly coupled with passwords.
    """
    
    # Configuration
    CODE_LENGTH = 12
    CODE_PREFIX = "NSE"
    CODE_SUFFIX_LENGTH = 8
    NUMERIC_PART_LENGTH = 4
    
    @classmethod
    def generate_unique_code(cls) -> str:
        """
        Generate a unique identification code.
        Format: NSE-XXXXXXXX-XXXX where XXXXXXXX is alphanumeric and XXXX is numeric
        Example: NSE-A7B3K9M2-1234
        """
        timestamp = str(int(time.time()))[-4:]  # Last 4 digits of timestamp
        
        # Generate alphanumeric part
        alphanumeric_chars = string.ascii_uppercase + string.digits
        alphanumeric_part = ''.join(secrets.choice(alphanumeric_chars) for _ in range(cls.CODE_SUFFIX_LENGTH))
        
        # Generate numeric part
        numeric_part = ''.join(secrets.choice(string.digits) for _ in range(cls.NUMERIC_PART_LENGTH))
        
        # Combine parts
        unique_code = f"{cls.CODE_PREFIX}-{alphanumeric_part}-{numeric_part}"
        
        # Add timestamp-based uniqueness
        hash_input = f"{unique_code}-{timestamp}"
        hash_suffix = hashlib.md5(hash_input.encode()).hexdigest()[:4].upper()
        
        final_code = f"{cls.CODE_PREFIX}-{alphanumeric_part}{hash_suffix}-{numeric_part}"
        
        return final_code
    
    @classmethod
    def validate_code_format(cls, code: str) -> bool:
        """
        Validate that the code follows the expected format.
        Format: NSE-XXXXXXXX-XXXX where X is alphanumeric/numeric
        """
        if not code:
            return False
        
        parts = code.split('-')
        if len(parts) != 3:
            return False
        
        prefix, middle, suffix = parts
        
        # Check prefix
        if prefix != cls.CODE_PREFIX:
            return False
        
        # Check middle part (alphanumeric)
        if len(middle) != cls.CODE_SUFFIX_LENGTH:
            return False
        
        if not middle.isalnum():
            return False
        
        # Check suffix part (numeric)
        if len(suffix) != cls.NUMERIC_PART_LENGTH:
            return False
        
        if not suffix.isdigit():
            return False
        
        return True
    
    @classmethod
    def is_code_unique(cls, code: str, exclude_user_id: Optional[int] = None) -> bool:
        """
        Check if a code is unique in the database.
        """
        from .models import User
        
        query = User.objects.filter(unique_identification_code=code)
        if exclude_user_id:
            query = query.exclude(id=exclude_user_id)
        
        return not query.exists()
    
    @classmethod
    def generate_unique_code_with_retry(cls, max_attempts: int = 100, exclude_user_id: Optional[int] = None) -> str:
        """
        Generate a unique code with retry logic.
        """
        for attempt in range(max_attempts):
            code = cls.generate_unique_code()
            
            if cls.is_code_unique(code, exclude_user_id):
                return code
            
            # Add small delay to avoid collisions in rapid generation
            time.sleep(0.001)
        
        raise ValidationError(f"Failed to generate unique code after {max_attempts} attempts")
    
    @classmethod
    def regenerate_code(cls, exclude_user_id: Optional[int] = None) -> str:
        """
        Regenerate a new unique code (used for password reset, etc.).
        """
        return cls.generate_unique_code_with_retry(exclude_user_id=exclude_user_id)
    
    @classmethod
    def verify_code_password_pair(cls, code: str, password: str, stored_code: str, stored_hash: str, salt: str) -> bool:
        """
        Verify that the provided code matches the stored code and password is correct.
        This ensures the code and password always go hand-in-hand.
        """
        # First verify the code matches
        if code != stored_code:
            return False
        
        # Then verify the password with the stored hash and salt
        from .auth import SecurityUtils
        return SecurityUtils.verify_password_with_salt(password, stored_hash, salt)
    
    @classmethod
    def generate_code_display(cls, code: str, masked: bool = True) -> str:
        """
        Generate a display version of the code (for admin purposes only).
        Users should never see their code.
        """
        if not cls.validate_code_format(code):
            return "INVALID_CODE"
        
        if masked:
            parts = code.split('-')
            if len(parts) == 3:
                prefix, middle, suffix = parts
                # Show only first and last characters
                masked_middle = f"{middle[:2]}{'*' * (len(middle) - 4)}{middle[-2:]}"
                return f"{prefix}-{masked_middle}-{suffix}"
        
        return code


class IdentificationCodeManager:
    """
    Manages identification codes for users with enhanced security features.
    """
    
    @staticmethod
    def create_user_with_code(user_data: dict) -> Tuple[str, str]:
        """
        Create a user with a unique identification code.
        Returns (unique_code, display_code)
        """
        # Generate unique code
        unique_code = UniqueIdentificationCodeGenerator.generate_unique_code_with_retry()
        
        # Add code to user data
        user_data['unique_identification_code'] = unique_code
        
        return unique_code, unique_code  # In production, return masked version for display
    
    @staticmethod
    def verify_user_access(code: str, password: str, user) -> bool:
        """
        Verify user access using both code and password.
        """
        if not user.unique_identification_code:
            return False
        
        return UniqueIdentificationCodeGenerator.verify_code_password_pair(
            code, password, 
            user.unique_identification_code, 
            user.password, 
            user.password_salt
        )
    
    @staticmethod
    def regenerate_user_code(user) -> str:
        """
        Regenerate user's unique identification code.
        Used when password is reset.
        """
        new_code = UniqueIdentificationCodeGenerator.regenerate_code(exclude_user_id=user.id)
        user.unique_identification_code = new_code
        user.save()
        return new_code
    
    @staticmethod
    def validate_code_for_user(code: str, user) -> bool:
        """
        Validate that the code belongs to the user.
        """
        return code == user.unique_identification_code


class CodeSecurityValidator:
    """
    Security validator for identification codes.
    """
    
    @staticmethod
    def validate_code_security(code: str) -> dict:
        """
        Validate code security properties.
        """
        result = {
            'is_valid_format': False,
            'is_secure': False,
            'entropy_score': 0,
            'issues': []
        }
        
        # Check format
        if not UniqueIdentificationCodeGenerator.validate_code_format(code):
            result['issues'].append('Invalid format')
            return result
        
        result['is_valid_format'] = True
        
        # Calculate entropy
        parts = code.split('-')
        if len(parts) == 3:
            _, middle, suffix = parts
            
            # Calculate character diversity
            unique_chars = len(set(middle + suffix))
            total_chars = len(middle + suffix)
            entropy_score = unique_chars / total_chars if total_chars > 0 else 0
            
            result['entropy_score'] = entropy_score
            
            # Check if entropy is sufficient
            if entropy_score >= 0.6:
                result['is_secure'] = True
            else:
                result['issues'].append('Low entropy score')
        
        return result
    
    @staticmethod
    def check_code_compromise(code: str, user) -> dict:
        """
        Check if the code has been compromised.
        """
        result = {
            'is_compromised': False,
            'compromise_type': None,
            'recommendations': []
        }
        
        # Check if code matches user's code
        if code != user.unique_identification_code:
            result['is_compromised'] = True
            result['compromise_type'] = 'mismatch'
            result['recommendations'].append('Code does not match user record')
        
        # Check format security
        security_result = CodeSecurityValidator.validate_code_security(code)
        if not security_result['is_secure']:
            result['is_compromised'] = True
            result['compromise_type'] = 'weak_code'
            result['recommendations'].extend(security_result['issues'])
        
        return result
