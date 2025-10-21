from rest_framework import generics, permissions
from .models import Observation
from .serializers import ObservationSerializer

class ObservationListCreateView(generics.ListCreateAPIView):
    serializer_class = ObservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Observation.objects.filter(user=self.request.user).order_by('id')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
