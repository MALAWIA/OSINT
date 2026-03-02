from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile
from .auth import SecurityUtils


class UserSerializer(serializers.ModelSerializer):
    """User serializer for API responses"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone_number', 'date_of_birth', 
                  'is_verified', 'is_active', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile serializer for API responses"""
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'bio', 'avatar', 'location', 'website', 'linkedin', 'twitter',
                  'investment_experience', 'risk_tolerance', 'preferred_sectors', 
                  'notification_preferences', 'is_active_trader', 'trading_goals',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """User registration serializer with enhanced password hashing and unique ID"""
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password_confirm', 
                  'phone_number', 'date_of_birth']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError("A user with this email already exists")
        
        return attrs
    
    def create(self, validated_data):
        # Remove password_confirm from validated_data
        password = validated_data.pop('password_confirm')
        
        # Generate a simple unique identification code
        import secrets
        import string
        import time
        code_chars = string.ascii_uppercase + string.digits
        code = ''.join(secrets.choice(code_chars) for _ in range(12))
        unique_code = f"NSE-{code}-{str(int(time.time()))[-4:]}"
        
        # Create user without password first (let Django handle password hashing)
        user_data = validated_data.copy()
        user_data['password'] = password  # Use plain password for create_user
        user = User.objects.create_user(**user_data)
        
        # Store unique code on user model
        user.unique_identification_code = unique_code
        user.save()
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Login serializer that only requires email and password"""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    # unique_identification_code is now optional for backward compatibility
    unique_identification_code = serializers.CharField(write_only=True, required=False, min_length=12, max_length=20)
    
    def validate(self, attrs):
        # Check if user exists
        try:
            user = User.objects.get(email=attrs['email'].lower())
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password")
        
        # If unique identification code is provided, validate it (for backward compatibility)
        if 'unique_identification_code' in attrs and attrs['unique_identification_code']:
            if not UniqueIdentificationCodeGenerator.validate_code_format(attrs['unique_identification_code']):
                raise serializers.ValidationError("Invalid identification code format")
            
            if not IdentificationCodeManager.validate_code_for_user(attrs['unique_identification_code'], user):
                raise serializers.ValidationError("Invalid identification code")
        
        return attrs


class PasswordResetSerializer(serializers.Serializer):
    """Password reset serializer that regenerates unique identification code"""
    
    email = serializers.EmailField()
    
    def validate(self, attrs):
        try:
            user = User.objects.get(email=attrs['email'].lower())
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist")
        
        return attrs
    
    def save(self):
        email = self.validated_data['email']
        user = User.objects.get(email=email.lower())
        
        # Generate new unique identification code
        new_code = IdentificationCodeManager.regenerate_user_code(user)
        
        # Generate password reset token
        from django.utils import timezone
        import secrets
        token = secrets.token_urlsafe(32)
        user.password_reset_token = token
        user.password_reset_expires = timezone.now() + timezone.timedelta(hours=24)
        user.save()
        
        return {
            'message': 'Password reset initiated',
            'reset_token': token,
            'new_identification_code': new_code
        }


class GroupSerializer(serializers.ModelSerializer):
    """Group serializer for API responses"""
    
    creator = UserSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()
    is_full = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'creator', 'created_at', 'updated_at',
                 'visibility', 'max_members', 'is_active', 'member_count', 'is_full', 'is_member']
        read_only_fields = ['id', 'created_at', 'updated_at', 'creator']
    
    def get_member_count(self, obj):
        return obj.member_count
    
    def get_is_full(self, obj):
        return obj.is_full
    
    def get_is_member(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.members.filter(id=request.user.id).exists()
        return False


class GroupCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating groups with visibility settings"""
    
    class Meta:
        model = Group
        fields = ['name', 'description', 'visibility', 'max_members']
    
    def validate_max_members(self, value):
        """Validate max_members based on visibility"""
        if self.initial_data.get('visibility') == 'hidden':
            if value > 20:
                raise serializers.ValidationError("Hidden groups can have maximum 20 members")
        else:
            if value > 200:
                raise serializers.ValidationError("Public groups can have maximum 200 members")
        return value
    
    def validate_visibility(self, value):
        """Set default max_members based on visibility"""
        if value == 'hidden' and not self.initial_data.get('max_members'):
            self.initial_data['max_members'] = 20
        elif value == 'public' and not self.initial_data.get('max_members'):
            self.initial_data['max_members'] = 200
        return value
    
    def create(self, validated_data):
        validated_data['creator'] = self.context['request'].user
        return super().create(validated_data)


class GroupMembershipSerializer(serializers.ModelSerializer):
    """Group membership serializer"""
    
    user = UserSerializer(read_only=True)
    group = GroupSerializer(read_only=True)
    
    class Meta:
        model = GroupMembership
        fields = ['id', 'user', 'group', 'joined_at', 'is_active']
        read_only_fields = ['id', 'joined_at']
