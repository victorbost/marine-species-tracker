from django.db import models
from django.conf import settings
from core.models import TimeStampedModel

class Observation(TimeStampedModel, models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="observations", null=False, blank=False)
    species_name = models.CharField(max_length=100, null=False, blank=False)
    latitude = models.FloatField(null=False, blank=False)
    longitude = models.FloatField(null=False, blank=False)
    observation_datetime = models.DateTimeField(null=False, blank=False)
    location_name = models.CharField(max_length=255)
    depth = models.FloatField()
    temperature = models.FloatField()
    visibility = models.FloatField()
    notes = models.TextField(blank=True)
    VALIDATION_STATUS = [
        ('pending', 'Pending'),
        ('validated', 'Validated'),
        ('rejected', 'Rejected'),
    ]
    SOURCE_CHOICES = [
        ('user', 'User'),
        ('obis', 'OBIS'),
        ('other', 'Other External'),
    ]
    validated = models.CharField(max_length=10, choices=VALIDATION_STATUS, default='pending')
    source = models.CharField(max_length=32, choices=SOURCE_CHOICES, default="user")

    def __str__(self):
        return f"{self.species_name} by {self.user} on {self.observation_datetime}"
