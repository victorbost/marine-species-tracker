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
    id = serializers.SerializerMethodField()
    speciesName = serializers.CharField(source="species_name") # Add this
    commonName = serializers.CharField(source="common_name", allow_null=True) # Add this, with allow_null
    locationName = serializers.CharField(source="location_name") # Add this
    observationDatetime = serializers.DateTimeField(source="observation_datetime") # Add this

    class Meta:
        model = CuratedObservation
        geo_field = "location"
        # The fields here must match the new camelCase fields you're defining
        fields = ("id", "speciesName", "commonName", "observationDatetime", "locationName", "source")

    def get_source(self, obj):
        return "obis"

    def get_id(self, obj):
        return f"obis-{obj.id}"


class MapObservationSerializer(GeoFeatureModelSerializer):
    source = serializers.SerializerMethodField()
    id = serializers.SerializerMethodField()
    speciesName = serializers.CharField(source="species_name") # Add this
    commonName = serializers.CharField(source="common_name", allow_null=True) # Add this, with allow_null
    locationName = serializers.CharField(source="location_name") # Add this
    observationDatetime = serializers.DateTimeField(source="observation_datetime") # Add this

    class Meta:
        model = Observation
        geo_field = "location"
        # The fields here must match the new camelCase fields you're defining
        fields = ("id", "speciesName", "commonName", "observationDatetime", "locationName", "source")

    def get_source(self, obj):
        return "user"

    def get_id(self, obj):
        return f"user-{obj.id}"

# Optionally, you could define your own MapObservationSerializer here later
# For now, just use ObservationGeoSerializer for map results.
