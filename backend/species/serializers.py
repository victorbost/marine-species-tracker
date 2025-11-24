from rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import CuratedObservation


class CuratedObservationSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = CuratedObservation
        geo_field = "location"
        fields = (
            "id",
            "species_name",
            "common_name",
            "observation_date",
            "observation_datetime",
            "location",
            "location_name",
            "machine_observation",
            "validated",
            "source",
            "depth",
            "temperature",
            "visibility",
            "notes",
            "image",
            "user",
            "raw_data",
        )
        read_only_fields = fields
