from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import EmailTokenObtainPairView
from . import views

urlpatterns = [
    path('login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', views.RegisterView.as_view(), name='auth_register'),
    path('user/', views.UserDetailView.as_view(), name='auth_user'),
    path('profiles/me/', views.ProfileMeView.as_view(), name='profile_me'),
    path('logout/', views.LogoutView.as_view(), name='auth_logout'),
]
