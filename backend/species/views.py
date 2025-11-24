from rest_framework import generics
from .models import CuratedObservation
from .serializers import CuratedObservationSerializer


class CuratedObservationList(generics.ListAPIView):
    queryset = CuratedObservation.objects.all().order_by(
        "-observation_datetime"
    )
    serializer_class = CuratedObservationSerializer
    # Optional: add filters or search here
    # filter_backends = [DjangoFilterBackend, SearchFilter]
    # filterset_fields = ['species_name', 'source', 'observation_date']
    # search_fields = ['species_name', 'common_name', 'location_name']
