from django.urls import path
from .views import CuratedObservationList

urlpatterns = [
    path('curated/', CuratedObservationList.as_view(), name='curated-observation-list'),
]
