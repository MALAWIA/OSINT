from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """Custom user model extending Django's AbstractUser"""
    
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=100, blank=True, null=True)
    password_reset_token = models.CharField(max_length=100, blank=True, null=True)
    password_reset_expires = models.DateTimeField(null=True, blank=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    password_salt = models.CharField(max_length=64, blank=True, null=True)  # Added for salt storage
    unique_identification_code = models.CharField(max_length=20, unique=True, blank=True, null=True)  # Unique ID for authentication
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['email']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['unique_identification_code']),
        ]
    
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        """Return the user's full name."""
        return f"{self.first_name} {self.last_name}".strip()
    
    def save(self, *args, **kwargs):
        """Override save to set email as lowercase and generate unique ID if needed."""
        self.email = self.email.lower()
        
        # Generate unique identification code if not present
        if not self.unique_identification_code:
            from .identification_code import UniqueIdentificationCodeGenerator
            self.unique_identification_code = UniqueIdentificationCodeGenerator.generate_unique_code_with_retry()
        
        super().save(*args, **kwargs)


class UserProfile(models.Model):
    """Extended user profile with additional information"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    twitter = models.CharField(max_length=50, blank=True)
    investment_experience = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
            ('expert', 'Expert'),
        ],
        default='beginner'
    )
    risk_tolerance = models.CharField(
        max_length=20,
        choices=[
            ('conservative', 'Conservative'),
            ('moderate', 'Moderate'),
            ('aggressive', 'Aggressive'),
        ],
        default='moderate'
    )
    preferred_sectors = models.TextField(blank=True)  # JSON field for sectors
    notification_preferences = models.JSONField(default=dict, blank=True)
    
    # News preferences
    news_sources = models.JSONField(default=list, blank=True)  # Preferred news sources
    news_categories = models.JSONField(default=list, blank=True)  # Preferred categories
    news_frequency = models.CharField(
        max_length=20,
        choices=[
            ('real-time', 'Real-time notifications'),
            ('hourly', 'Hourly digest'),
            ('daily', 'Daily digest'),
            ('weekly', 'Weekly digest'),
        ],
        default='daily'
    )
    enable_news_alerts = models.BooleanField(default=True)
    
    is_active_trader = models.BooleanField(default=True)
    trading_goals = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"{self.user.email}'s Profile"


class Group(models.Model):
    """User-created groups and communities"""
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_groups')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Visibility settings
    VISIBILITY_CHOICES = [
        ('public', 'Public - Visible to all users'),
        ('hidden', 'Hidden - Only accessible via direct link'),
    ]
    visibility = models.CharField(
        max_length=10,
        choices=VISIBILITY_CHOICES,
        default='public'
    )
    
    # Group settings
    max_members = models.PositiveIntegerField(default=200)  # 200 for public, 20 for private
    is_active = models.BooleanField(default=True)
    
    # Membership
    members = models.ManyToManyField(User, through='GroupMembership', related_name='joined_groups')
    
    class Meta:
        db_table = 'groups'
        verbose_name = 'Group'
        verbose_name_plural = 'Groups'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def member_count(self):
        return self.members.count()
    
    @property
    def is_full(self):
        return self.member_count >= self.max_members


class GroupMembership(models.Model):
    """Group membership with join/leave tracking"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'group_memberships'
        verbose_name = 'Group Membership'
        verbose_name_plural = 'Group Memberships'
        unique_together = ['user', 'group']
    
    def __str__(self):
        return f"{self.user.email} in {self.group.name}"
