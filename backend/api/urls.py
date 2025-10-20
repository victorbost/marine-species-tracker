from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

urlpatterns = [
    path('', include(router.urls)),
    path('observations/', include('observations.urls')),
    path('species/', include('species.urls')),
    path('users/', include('users.urls')),
]
