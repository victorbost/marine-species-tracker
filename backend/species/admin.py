from django.contrib import admin
# from django.contrib.gis.admin import OSMGeoAdmin # Comment this out
from .models import CuratedObservation

# @admin.register(CuratedObservation) # Comment this out
class CuratedObservationAdmin(admin.ModelAdmin): # Use standard ModelAdmin
    list_display = (
        'species_name',
        'common_name',
        'observation_date',
        'location_name',
        'source',
        'validated',
        'obis_id'
    )
    list_filter = ('source', 'validated', 'observation_date', 'machine_observation')
    search_fields = ('species_name', 'common_name', 'location_name', 'notes', 'obis_id')
    readonly_fields = (
        'obis_id',
        'raw_data',
        'observation_datetime',
        'observation_date',
        'location',
        'machine_observation',
        'source',
        'user',
        'image'
    )
admin.site.register(CuratedObservation, CuratedObservationAdmin) # Register manually
