from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Observation
from .serializers import ObservationSerializer
from .permissions import IsAdminOrResearcher

class ObservationListCreateView(generics.ListCreateAPIView):
    serializer_class = ObservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Observation.objects.filter(user=self.request.user).order_by('id')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Detail
class ObservationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Observation.objects.all()
    serializer_class = ObservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only allow the owner (or admin/researcher) to view/update/delete
        user = self.request.user
        if user.is_staff or getattr(user, 'role', None) == 'researcher':
            return Observation.objects.all()
        return Observation.objects.filter(user=user)

# Export (not yet implemented)
class ObservationExportView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        # TODO: Implement export to JSON/CSV
        return Response({"detail": "Export endpoint not yet implemented."}, status=status.HTTP_501_NOT_IMPLEMENTED)

# Only admin/researcher can validate
class ObservationValidateView(APIView):
    permission_classes = [IsAdminOrResearcher]

    def post(self, request, pk):
        try:
            obs = Observation.objects.get(pk=pk)
        except Observation.DoesNotExist:
            return Response({"detail": "Observation not found."}, status=404)

        obs.validated = 'validated'
        obs.save()
        return Response(ObservationSerializer(obs).data)

# List curated/external (OBIS) only
class CuratedObservationListView(generics.ListAPIView):
    serializer_class = ObservationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Observation.objects.filter(source="obis")
