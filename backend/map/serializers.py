# backend/map/serializers.py
from observations.models import Observation
from species.models import CuratedObservation
from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer


class ObservationGeoSerializer(GeoFeatureModelSerializer):
    speciesName = serializers.CharField(source="species_name")
    locationName = serializers.CharField(source="location_name")
    observationDatetime = serializers.DateTimeField(
        source="observation_datetime"
    )

    class Meta:
        model = Observation
        geo_field = "location"
        fields = (
            "id",
            "speciesName",
            "location",
            "observationDatetime",
            "locationName",
            "source",
        )


class CuratedObservationGeoSerializer(GeoFeatureModelSerializer):
    speciesName = serializers.CharField(source="species_name")
    commonName = serializers.CharField(source="common_name")
    locationName = serializers.CharField(source="location_name")
    observationDatetime = serializers.DateTimeField(
        source="observation_datetime"
    )

    class Meta:
        model = CuratedObservation
        geo_field = "location"
        fields = (
            "id",
            "speciesName",
            "commonName",
            "location",
            "observationDatetime",
            "locationName",
            "source",
        )

class MapCuratedObservationSerializer(GeoFeatureModelSerializer):
    source = serializers.SerializerMethodField()
    id = serializers.SerializerMethodField() # Add this line

    class Meta:
        model = CuratedObservation
        geo_field = "location"
        fields = ("id", "species_name", "common_name", "observation_datetime", "location_name", "source")

    def get_source(self, obj):
        return "obis"

    def get_id(self, obj): # Add this method
        return f"obis-{obj.id}"


class MapObservationSerializer(GeoFeatureModelSerializer):
    source = serializers.SerializerMethodField()
    id = serializers.SerializerMethodField() # Add this line

    class Meta:
        model = Observation
        geo_field = "location"
        fields = ("id", "species_name", "common_name", "observation_datetime", "location_name", "source")

    def get_source(self, obj):
        return "user"

    def get_id(self, obj): # Add this method
        return f"user-{obj.id}"

# Optionally, you could define your own MapObservationSerializer here later
# For now, just use ObservationGeoSerializer for map results.
