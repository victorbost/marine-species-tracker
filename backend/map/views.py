# backend/map/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from observations.models import Observation
from .serializers import ObservationGeoSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def map_observations(request):
    """
    Geo-filtered observations for the map.
    Params: ?lat=<latitude>&lng=<longitude>&radius=<km>
    """
    lat = request.GET.get("lat")
    lng = request.GET.get("lng")
    radius = request.GET.get("radius", 50)

    queryset = Observation.objects.all()

    if lat and lng:
        try:
            lat, lng, radius = float(lat), float(lng), float(radius)
            point = Point(float(lng), float(lat))  # Note order: lng, lat!
            queryset = queryset.filter(location__distance_lte=(point, D(km=radius)))
        except (TypeError, ValueError):
            return Response({"detail": "Invalid latitude/longitude/radius."}, status=400)

    # Optionally: restrict to validated/public only here!
    # queryset = queryset.filter(validated='validated')

    serializer = ObservationGeoSerializer(queryset, many=True)
    return Response(serializer.data)
