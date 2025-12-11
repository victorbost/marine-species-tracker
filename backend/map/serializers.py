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
    # New fields for Observation
    commonName = serializers.CharField(
        source="common_name", allow_null=True, required=False
    )
    depthMin = serializers.FloatField(
        source="depth_min", allow_null=True, required=False
    )
    depthMax = serializers.FloatField(
        source="depth_max", allow_null=True, required=False
    )
    bathymetry = serializers.FloatField(allow_null=True, required=False)
    temperature = serializers.FloatField(allow_null=True, required=False)
    visibility = serializers.FloatField(allow_null=True, required=False)
    notes = serializers.CharField(allow_null=True, required=False)
    image = serializers.ImageField(allow_null=True, required=False)
    sex = serializers.CharField(allow_null=True, required=False)
    userId = serializers.PrimaryKeyRelatedField(
        source="user.id", read_only=True
    )
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Observation
        geo_field = "location"
        fields = (
            "id",
            "speciesName",
            "commonName",
            "location",
            "observationDatetime",
            "locationName",
            "source",
            "image",
            "depthMin",
            "depthMax",
            "bathymetry",
            "temperature",
            "visibility",
            "notes",
            "sex",
            "validated",
            "userId",
            "createdAt",
            "updatedAt",
        )


class CuratedObservationGeoSerializer(GeoFeatureModelSerializer):
    speciesName = serializers.CharField(source="species_name")
    commonName = serializers.CharField(source="common_name")
    locationName = serializers.CharField(source="location_name")
    observationDatetime = serializers.DateTimeField(
        source="observation_datetime"
    )
    depthMin = serializers.FloatField(
        source="depth_min", allow_null=True, required=False
    )
    depthMax = serializers.FloatField(
        source="depth_max", allow_null=True, required=False
    )
    bathymetry = serializers.FloatField(allow_null=True, required=False)
    temperature = serializers.FloatField(allow_null=True, required=False)
    visibility = serializers.FloatField(allow_null=True, required=False)
    notes = serializers.CharField(allow_null=True, required=False)
    image = serializers.URLField(
        allow_null=True, required=False
    )  # CuratedObservation uses URLField for image
    sex = serializers.CharField(allow_null=True, required=False)
    userId = serializers.CharField(
        source="user", allow_null=True, required=False
    )  # As user is a CharField in CuratedObservation

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
            "image",
            "depthMin",
            "depthMax",
            "bathymetry",
            "temperature",
            "visibility",
            "notes",
            "sex",
            "validated",
            "userId",
        )


class MapCuratedObservationSerializer(GeoFeatureModelSerializer):
    source = serializers.SerializerMethodField()
    id = serializers.SerializerMethodField()
    speciesName = serializers.CharField(source="species_name")  # Add this
    commonName = serializers.CharField(
        source="common_name", allow_null=True
    )  # Add this, with allow_null
    locationName = serializers.CharField(source="location_name")  # Add this
    observationDatetime = serializers.DateTimeField(
        source="observation_datetime"
    )  # Add this
    depthMin = serializers.FloatField(
        source="depth_min", allow_null=True, required=False
    )
    depthMax = serializers.FloatField(
        source="depth_max", allow_null=True, required=False
    )
    bathymetry = serializers.FloatField(allow_null=True, required=False)
    temperature = serializers.FloatField(allow_null=True, required=False)
    visibility = serializers.FloatField(allow_null=True, required=False)
    notes = serializers.CharField(allow_null=True, required=False)
    image = serializers.URLField(allow_null=True, required=False)
    sex = serializers.CharField(allow_null=True, required=False)
    username = serializers.CharField(
        source="user.username", read_only=True, allow_null=True
    )  # ADD THIS LINE

    class Meta:
        model = CuratedObservation
        geo_field = "location"
        # The fields here must match the new camelCase fields you're defining
        fields = (
            "id",
            "speciesName",
            "commonName",
            "location",
            "observationDatetime",
            "locationName",
            "source",
            "image",
            "depthMin",
            "depthMax",
            "bathymetry",
            "temperature",
            "visibility",
            "notes",
            "sex",
            "validated",
            "username",
        )

    def get_source(self, obj):
        return "obis"

    def get_id(self, obj):
        return f"obis-{obj.id}"


class MapObservationSerializer(GeoFeatureModelSerializer):
    source = serializers.SerializerMethodField()
    id = serializers.SerializerMethodField()
    speciesName = serializers.CharField(source="species_name")  # Add this
    commonName = serializers.CharField(
        source="common_name", allow_null=True
    )  # Add this, with allow_null
    locationName = serializers.CharField(source="location_name")  # Add this
    observationDatetime = serializers.DateTimeField(
        source="observation_datetime"
    )  # Add this
    depthMin = serializers.FloatField(
        source="depth_min", allow_null=True, required=False
    )
    depthMax = serializers.FloatField(
        source="depth_max", allow_null=True, required=False
    )
    bathymetry = serializers.FloatField(allow_null=True, required=False)
    temperature = serializers.FloatField(allow_null=True, required=False)
    visibility = serializers.FloatField(allow_null=True, required=False)
    notes = serializers.CharField(allow_null=True, required=False)
    image = serializers.ImageField(allow_null=True, required=False)
    sex = serializers.CharField(allow_null=True, required=False)
    userId = serializers.PrimaryKeyRelatedField(
        source="user.id", read_only=True
    )
    username = serializers.CharField(
        source="user.username", read_only=True, allow_null=True
    )  # ADD THIS LINE
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Observation
        geo_field = "location"
        # The fields here must match the new camelCase fields you're defining
        fields = (
            "id",
            "speciesName",
            "commonName",
            "location",
            "observationDatetime",
            "locationName",
            "source",
            "image",
            "depthMin",
            "depthMax",
            "bathymetry",
            "temperature",
            "visibility",
            "notes",
            "sex",
            "validated",
            "userId",
            "username",
            "createdAt",
            "updatedAt",
        )

    def get_source(self, obj):
        return "user"

    def get_id(self, obj):
        return f"user-{obj.id}"


# Optionally, you could define your own MapObservationSerializer here later
# For now, just use ObservationGeoSerializer for map results.
