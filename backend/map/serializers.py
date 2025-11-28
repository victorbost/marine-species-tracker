# backend/map/serializers.py
from observations.models import Observation
from species.models import CuratedObservation
from rest_framework_gis.serializers import GeoFeatureModelSerializer


class ObservationGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Observation
        geo_field = "location"
        fields = (
            "id",
            "species_name",
            "location",
            "observation_datetime",
            "location_name",
            "source",
        )


class CuratedObservationGeoSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = CuratedObservation
        geo_field = "location"
        fields = (
            "id",
            "species_name",
            "common_name",
            "location",
            "observation_datetime",
            "location_name",
            "source",
        )


# Optionally, you could define your own MapObservationSerializer here later
# For now, just use ObservationGeoSerializer for map results.
