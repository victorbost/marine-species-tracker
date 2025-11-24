from django.contrib.gis.db import models


class CuratedObservation(models.Model):
    # Basic reference info
    species_name = models.CharField(max_length=255)
    common_name = models.CharField(
        max_length=255, blank=True, null=True
    )  # from WoRMS
    obis_id = models.CharField(
        max_length=100, unique=True
    )  # OBIS record unique ID

    # Observation detail
    observation_date = models.DateField(blank=True, null=True)
    observation_datetime = models.DateTimeField(blank=True, null=True)
    location = models.PointField(geography=True, null=True, blank=True)
    location_name = models.CharField(max_length=512, blank=True, null=True)
    machine_observation = models.CharField(
        max_length=128, blank=True, null=True
    )
    validated = models.CharField(max_length=128, blank=True, null=True)
    source = models.CharField(max_length=50, default="OBIS")

    # Scientific/Environmental info
    depth_min = models.FloatField(blank=True, null=True)
    depth_max = models.FloatField(blank=True, null=True)
    bathymetry = models.FloatField(blank=True, null=True)
    temperature = models.FloatField(blank=True, null=True)
    visibility = models.FloatField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    # Media/info
    image = models.URLField(blank=True, null=True)

    # Extra data for user/ownership (if relevant in the future)
    user = models.CharField(max_length=255, blank=True, null=True)

    # New 'sex' field
    SEX_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("unknown", "Unknown"),
    ]
    sex = models.CharField(
        max_length=10,
        choices=SEX_CHOICES,
        default="unknown",
        blank=True,
        null=True,
    )

    # Raw API data
    raw_data = models.JSONField(blank=True, null=True)

    class Meta:
        unique_together = ("obis_id", "source")
        ordering = ["-observation_date"]

    def __str__(self):
        return f"{self.species_name} ({self.common_name or 'No common name'})"
