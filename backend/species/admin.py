from django.contrib import admin
# No need to import OSMGeoAdmin if you're not using it
from .models import CuratedObservation

@admin.register(CuratedObservation)
class CuratedObservationAdmin(admin.ModelAdmin): # Use standard ModelAdmin
    list_display = (
        'id', # Primary key ID
        'species_name',
        'common_name',
        'obis_id',
        'observation_date',
        'observation_datetime',
        'location', # This will display as text (e.g., POINT (X Y))
        'location_name',
        'machine_observation',
        'validated',
        'source',
        'depth',
        'temperature',
        'visibility',
        'notes',
        'image',
        'user',
    )
    list_filter = (
        'source',
        'validated',
        'observation_date',
        'machine_observation',
        'common_name',
        'species_name',
    )
    search_fields = (
        'species_name',
        'common_name',
        'location_name',
        'notes',
        'obis_id',
    )
    readonly_fields = (
        'id',
        'species_name',
        'common_name',
        'obis_id',
        'observation_date',
        'observation_datetime',
        'location',
        'location_name',
        'machine_observation',
        'validated',
        'source',
        'depth',
        'temperature',
        'visibility',
        'notes',
        'image',
        'user',
        'raw_data',
    )
