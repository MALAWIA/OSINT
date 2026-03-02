from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('password-reset/', views.password_reset_view, name='password-reset'),
    path('reset-password/', views.reset_password_with_token_view, name='reset-password'),
    path('list/', views.user_list_view, name='user-list'),
    
    # Group management endpoints
    path('groups/', views.groups_list_view, name='groups-list'),
    path('groups/my/', views.my_groups_view, name='my-groups'),
    path('groups/create/', views.create_group_view, name='create-group'),
    path('groups/<int:group_id>/join/', views.join_group_view, name='join-group'),
    path('groups/<int:group_id>/leave/', views.leave_group_view, name='leave-group'),
    path('groups/<int:group_id>/update/', views.update_group_view, name='update-group'),
    path('groups/<int:group_id>/delete/', views.delete_group_view, name='delete-group'),
]
