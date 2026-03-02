from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserProfile, LoginAttempt


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_verified', 'created_at', 'last_login')
    list_filter = ('is_verified', 'is_active', 'created_at', 'last_login')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at', 'last_login', 'last_login_ip')
    
    fieldsets = (
        (None, {
            'fields': ('email', 'password', 'first_name', 'last_name')
        }),
        ('Personal Info', {
            'fields': ('phone_number', 'date_of_birth',)
        }),
        ('Verification', {
            'fields': ('is_verified', 'verification_token')
        }),
        ('Security', {
            'fields': ('password_reset_token', 'password_reset_expires', 'last_login_ip')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'location', 'investment_experience', 'risk_tolerance', 'is_active_trader')
    list_filter = ('investment_experience', 'risk_tolerance', 'is_active_trader', 'created_at')
    search_fields = ('user__email', 'location', 'bio')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('user', 'bio', 'location', 'website')
        }),
        ('Social Media', {
            'fields': ('linkedin', 'twitter',)
        }),
        ('Trading Info', {
            'fields': ('investment_experience', 'risk_tolerance', 'preferred_sectors', 'trading_goals', 'is_active_trader')
        }),
        ('Preferences', {
            'fields': ('notification_preferences', 'avatar')
        }),
    )


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ('email', 'ip_address', 'success', 'failure_reason', 'timestamp')
    list_filter = ('success', 'timestamp')
    search_fields = ('email', 'ip_address')
    readonly_fields = ('timestamp',)
    ordering = ('-timestamp',)
