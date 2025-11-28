# backend/map/views.py

from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from observations.models import Observation
from species.models import CuratedObservation

from .serializers import (
    ObservationGeoSerializer,
    CuratedObservationGeoSerializer,
)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def map_observations(request):
    """
    Geo-filtered observations for the map.
    Params: ?lat=<latitude>&lng=<longitude>&radius=<km>
    """
    lat = request.GET.get("lat")
    lng = request.GET.get("lng")
    radius = request.GET.get("radius", 50)

    user_observations_queryset = Observation.objects.all()
    curated_species_queryset = CuratedObservation.objects.all()

    if lat and lng:
        try:
            lat, lng, radius = float(lat), float(lng), float(radius)
            point = Point(float(lng), float(lat))  # Note order: lng, lat!
            distance_filter = D(km=radius)

            # Apply geo-filtering to both querysets
            user_observations_queryset = user_observations_queryset.filter(
                location__distance_lte=(point, distance_filter)
            )
            curated_species_queryset = curated_species_queryset.filter(
                location__distance_lte=(point, distance_filter)
            )
        except (TypeError, ValueError):
            return Response(
                {"detail": "Invalid latitude/longitude/radius."}, status=400
            )

    # Serialize both querysets
    # The 'data' from GeoFeatureModelSerializer is a GeoJSON FeatureCollection,
    # so we extract the 'features' list.
    user_serializer = ObservationGeoSerializer(
        user_observations_queryset, many=True
    )
    curated_serializer = CuratedObservationGeoSerializer(
        curated_species_queryset, many=True
    )

    # Combine the features from both serializers
    combined_features = (
        user_serializer.data["features"] + curated_serializer.data["features"]
    )

    # Return a single GeoJSON FeatureCollection containing all combined features
    return Response(
        {"type": "FeatureCollection", "features": combined_features}
    )
