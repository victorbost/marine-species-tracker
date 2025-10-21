from django.urls import path
from .views import ObservationListCreateView

urlpatterns = [
    path('', ObservationListCreateView.as_view(), name='user-observations'),
]
