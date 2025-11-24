from django.db import models
from django.conf import settings
from django.contrib.gis.db import models as gis_models
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError
from core.models import TimeStampedModel
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile


def validate_image(image):
    max_size = 2 * 1024 * 1024  # 2MB
    if image.size > max_size:
        raise ValidationError("Image file too large ( > 2MB ).")
    # File extension validator still applies in image field
    return image


class Observation(TimeStampedModel, models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="observations",
        null=False,
        blank=False,
    )
    species_name = models.CharField(max_length=100, null=False, blank=False)
    location = gis_models.PointField(geography=True, null=False, blank=False)
    observation_datetime = models.DateTimeField(null=False, blank=False)
    location_name = models.CharField(max_length=255)
    depth = models.FloatField()
    temperature = models.FloatField()
    visibility = models.FloatField()
    notes = models.TextField(blank=True)
    image = models.ImageField(
        upload_to="observation_pics/",
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=["jpg", "jpeg", "png"]),
            validate_image,
        ],
        help_text=(
            "Optional picture of the observed species (max 2MB, resized to"
            " 512x512px)."
        ),
    )
    VALIDATION_STATUS = [
        ("pending", "Pending"),
        ("validated", "Validated"),
        ("rejected", "Rejected"),
    ]
    SOURCE_CHOICES = [
        ("user", "User"),
        ("obis", "OBIS"),
        ("other", "Other External"),
    ]
    validated = models.CharField(
        max_length=10, choices=VALIDATION_STATUS, default="pending"
    )
    source = models.CharField(
        max_length=32, choices=SOURCE_CHOICES, default="user"
    )

    def save(self, *args, **kwargs):
        if self.image and hasattr(self.image, "file"):
            img = Image.open(self.image)
            max_width, max_height = 512, 512
            if img.height > max_height or img.width > max_width:
                output_size = (max_width, max_height)
                img.thumbnail(output_size)
                img_format = img.format if img.format else "JPEG"
                img_io = BytesIO()
                img.save(img_io, format=img_format)
                img_content = ContentFile(img_io.getvalue(), self.image.name)
                self.image.save(self.image.name, img_content, save=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.species_name} by {self.user} on"
            f" {self.observation_datetime}"
        )
