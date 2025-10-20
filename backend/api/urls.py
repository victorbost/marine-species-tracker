from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

urlpatterns = [
    path('v1/auth/', include('users.urls')),    # <- THIS line is crucial!
    path('observations/', include('observations.urls')),
    path('species/', include('species.urls')),
    # ... (other includes)
]
