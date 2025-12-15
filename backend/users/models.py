from django.contrib.auth.models import AbstractUser
from django.db import models

from core.models import TimeStampedModel


class User(TimeStampedModel, AbstractUser):
    HOBBYIST = "hobbyist"
    RESEARCHER = "researcher"
    ROLE_CHOICES = [
        (HOBBYIST, "Hobbyist"),
        (RESEARCHER, "Researcher"),
    ]
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=HOBBYIST,
        blank=False,
        null=False,
    )

    # Email verification fields
    email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(
        max_length=100, blank=True, null=True
    )
    email_verification_token_created = models.DateTimeField(
        blank=True, null=True
    )
