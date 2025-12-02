from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from .models import Observation


class ObservationGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Observation
        geo_field = "location"
        fields = (
            "id",
            "species_name",
            "common_name",
            "observation_datetime",
            "location",
            "location_name",
            "depth_min",
            "depth_max",
            "bathymetry",
            "temperature",
            "image",
            "visibility",
            "notes",
            "validated",
            "source",
            "user",
            "sex",
        )
    read_only_fields = ("user", "source", "validated", "created_at", "updated_at")
    def update(self, instance, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        # Prevent hobbyist from updating 'validated' field
        if "validated" in validated_data:
            if not user or not (
                user.is_staff or getattr(user, "role", None) == "researcher"
            ):
                raise serializers.ValidationError({
                    "validated": (
                        "You do not have permission to validate observations."
                    )
                })
        return super().update(instance, validated_data)
