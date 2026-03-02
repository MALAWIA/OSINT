from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import UserProfile, LoginAttempt, Group, GroupMembership
from .serializers import UserSerializer, UserProfileSerializer, UserRegistrationSerializer, UserLoginSerializer, PasswordResetSerializer, GroupSerializer, GroupMembershipSerializer
from .auth import CustomAuthBackend, SecurityUtils
from .identification_code import UniqueIdentificationCodeGenerator, IdentificationCodeManager
import json
import hashlib
import secrets
from datetime import timedelta
from django.utils import timezone
from django_ratelimit.decorators import ratelimit


@api_view(['POST'])
@permission_classes([])
def register_view(request):
    """User registration endpoint"""
    try:
        data = json.loads(request.body)
        serializer = UserRegistrationSerializer(data=data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Create user profile
            UserProfile.objects.create(user=user)
            
            # Log registration attempt
            LoginAttempt.objects.create(
                email=user.email,
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                success=True
            )
            
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([])
def login_view(request):
    """User login endpoint with optional unique identification code"""
    try:
        data = json.loads(request.body)
        
        # Use the updated login serializer that makes unique_identification_code optional
        serializer = UserLoginSerializer(data=data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        unique_code = serializer.validated_data.get('unique_identification_code')  # Optional now
        
        # Use custom authentication backend with optional unique identification code
        auth_backend = CustomAuthBackend()
        user = auth_backend.authenticate(
            request, 
            username=email, 
            password=password,
            unique_identification_code=unique_code  # Pass None if not provided
        )
        
        if user is not None:
            # Log successful login attempt
            LoginAttempt.objects.create(
                email=user.email,
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                success=True
            )
            
            # Create session
            login(request, user)
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'access': access_token,
                'refresh': refresh_token,
            }, status=status.HTTP_200_OK)
        else:
            # Log failed login attempt
            LoginAttempt.objects.create(
                email=email,
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                success=False,
                failure_reason='Invalid credentials' + (' or identification code' if unique_code else '')
            )
            return Response({
                'error': 'Invalid email, password' + (', or identification code' if unique_code else '')
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """User logout endpoint"""
    try:
        logout(request)
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@permission_classes([])
def password_reset_view(request):
    """Password reset endpoint that regenerates unique identification code"""
    try:
        data = json.loads(request.body)
        serializer = PasswordResetSerializer(data=data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        result = serializer.save()
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_password_with_token_view(request):
    """Reset password using token and regenerate unique identification code"""
    try:
        data = json.loads(request.body)
        token = data.get('token')
        new_password = data.get('new_password')
        
        if not token or not new_password:
            return Response({
                'error': 'Token and new password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        
        # Validate token
        if not user.password_reset_token or user.password_reset_token != token:
            return Response({
                'error': 'Invalid or expired token'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if user.password_reset_expires and user.password_reset_expires < timezone.now():
            return Response({
                'error': 'Token has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate new unique identification code
        new_code = IdentificationCodeManager.regenerate_user_code(user)
        
        # Set new password
        user.set_password(new_password)
        
        # Clear reset token
        user.password_reset_token = None
        user.password_reset_expires = None
        user.save()
        
        return Response({
            'message': 'Password reset successful',
            'new_identification_code': new_code
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@ratelimit(key='user', rate='100/h', method='GET')
@ratelimit(key='user', rate='10/h', method='PUT')
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """User profile endpoint"""
    try:
        user = request.user
        
        if request.method == 'GET':
            try:
                profile = user.profile
                return Response({
                    'user': UserSerializer(user).data,
                    'profile': UserProfileSerializer(profile).data
                }, status=status.HTTP_200_OK)
            except UserProfile.DoesNotExist:
                # Create profile if it doesn't exist
                profile = UserProfile.objects.create(user=user)
                return Response({
                    'user': UserSerializer(user).data,
                    'profile': UserProfileSerializer(profile).data
                }, status=status.HTTP_200_OK)
        
        elif request.method == 'PUT':
            try:
                profile = user.profile
                data = json.loads(request.body)
                serializer = UserProfileSerializer(profile, data=data, partial=True)
                
                if serializer.is_valid():
                    serializer.save()
                    return Response({
                        'message': 'Profile updated successfully',
                        'profile': serializer.data
                    }, status=status.HTTP_200_OK)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                    
            except UserProfile.DoesNotExist:
                return Response({
                    'error': 'Profile not found'
                }, status=status.HTTP_404_NOT_FOUND)
                
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@ratelimit(key='user', rate='50/h', method='GET')
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_list_view(request):
    """List all users (admin only)"""
    try:
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@ratelimit(key='user', rate='20/h')
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_group_view(request):
    """Create a new group with visibility settings"""
    try:
        serializer = GroupCreateSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            group = serializer.save()
            return Response({
                'message': 'Group created successfully',
                'group': GroupSerializer(group, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@ratelimit(key='user', rate='50/h')
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def groups_list_view(request):
    """List groups based on visibility and user membership"""
    try:
        user = request.user
        
        # Get all public groups
        public_groups = Group.objects.filter(visibility='public', is_active=True)
        
        # Get groups where user is a member (including hidden ones they can access)
        member_groups = Group.objects.filter(
            members=user,
            is_active=True
        )
        
        # Combine and remove duplicates
        all_groups = (public_groups | member_groups).distinct()
        
        serializer = GroupSerializer(all_groups, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@ratelimit(key='user', rate='30/h')
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_groups_view(request):
    """List groups created by or joined by the user"""
    try:
        user = request.user
        
        # Groups created by user
        created_groups = Group.objects.filter(creator=user, is_active=True)
        
        # Groups joined by user
        joined_groups = Group.objects.filter(members=user, is_active=True).exclude(creator=user)
        
        result = {
            'created_groups': GroupSerializer(created_groups, many=True, context={'request': request}).data,
            'joined_groups': GroupSerializer(joined_groups, many=True, context={'request': request}).data
        }
        
        return Response(result, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@ratelimit(key='user', rate='30/h')
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_group_view(request, group_id):
    """Join a group"""
    try:
        user = request.user
        
        try:
            group = Group.objects.get(id=group_id, is_active=True)
        except Group.DoesNotExist:
            return Response({
                'error': 'Group not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if group is public or user has access
        if group.visibility == 'hidden' and not group.members.filter(id=user.id).exists():
            return Response({
                'error': 'This group is private and requires an invitation'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user is already a member
        if group.members.filter(id=user.id).exists():
            return Response({
                'error': 'You are already a member of this group'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if group is full
        if group.is_full:
            return Response({
                'error': 'This group is full'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Add user to group
        GroupMembership.objects.create(user=user, group=group)
        
        return Response({
            'message': 'Successfully joined the group',
            'group': GroupSerializer(group, context={'request': request}).data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@ratelimit(key='user', rate='30/h')
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_group_view(request, group_id):
    """Leave a group"""
    try:
        user = request.user
        
        try:
            group = Group.objects.get(id=group_id, is_active=True)
        except Group.DoesNotExist:
            return Response({
                'error': 'Group not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if user is a member
        try:
            membership = GroupMembership.objects.get(user=user, group=group, is_active=True)
        except GroupMembership.DoesNotExist:
            return Response({
                'error': 'You are not a member of this group'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Cannot leave if you're the creator
        if group.creator == user:
            return Response({
                'error': 'Group creators cannot leave their own groups'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark membership as inactive
        membership.is_active = False
        membership.save()
        
        return Response({
            'message': 'Successfully left the group'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@ratelimit(key='user', rate='20/h')
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_group_view(request, group_id):
    """Update group settings (creator only)"""
    try:
        user = request.user
        
        try:
            group = Group.objects.get(id=group_id, creator=user, is_active=True)
        except Group.DoesNotExist:
            return Response({
                'error': 'Group not found or you are not the creator'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Only allow updating certain fields
        allowed_fields = ['name', 'description', 'visibility', 'max_members']
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        serializer = GroupCreateSerializer(group, data=update_data, partial=True, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Group updated successfully',
                'group': GroupSerializer(group, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@ratelimit(key='user', rate='10/h')
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_group_view(request, group_id):
    """Delete a group (creator only)"""
    try:
        user = request.user
        
        try:
            group = Group.objects.get(id=group_id, creator=user, is_active=True)
        except Group.DoesNotExist:
            return Response({
                'error': 'Group not found or you are not the creator'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Soft delete
        group.is_active = False
        group.save()
        
        return Response({
            'message': 'Group deleted successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def generate_verification_token():
    """Generate a secure verification token"""
    return secrets.token_urlsafe(32)


def generate_password_reset_token():
    """Generate a secure password reset token"""
    return secrets.token_urlsafe(32)


def get_client_ip(request):
    """Get the client IP address from the request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
