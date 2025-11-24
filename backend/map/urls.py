# backend/map/urls.py

from django.urls import path

from .views import map_observations

urlpatterns = [
    path("observations/", map_observations, name="map-observations"),
]
