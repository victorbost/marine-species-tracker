import base64
from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.conf import settings

from observations.serializers import ObservationGeoSerializer

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, required=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("id", "email", "password", "username", "role")

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            username=validated_data["username"],
            password=validated_data["password"],
            role=validated_data["role"],
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "role",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "role", "created_at", "updated_at")


class UserProfileSerializer(UserSerializer):
    observation_count = serializers.SerializerMethodField()
    observations = ObservationGeoSerializer(many=True, read_only=True)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + (
            "observation_count",
            "observations",
        )

    def get_observation_count(self, obj):
        return obj.observations.count()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username = None
    email = serializers.EmailField()
    password = serializers.CharField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove username from fields
        self.fields.pop("username", None)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError(
                "Must include 'email' and 'password'."
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("No user with this email.")

        attrs["username"] = user.username  # SimpleJWT expects 'username'
        return super().validate(attrs)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "No user is associated with this email address."
            )
        self.user = user
        return value

    def save(self):
        user = self.user
        token = default_token_generator.make_token(user)
        uid = base64.urlsafe_b64encode(force_bytes(str(user.pk))).decode(
            "ascii"
        )
        pk_as_string = str(user.pk)
        pk_as_bytes = force_bytes(pk_as_string)
        uid = base64.urlsafe_b64encode(pk_as_bytes).decode("ascii")

        # --- Environment-specific domain logic ---
        if settings.DEBUG:
            # For development, use localhost or your local frontend dev server
            current_site_domain = (  # Or whatever your frontend dev server is
                "localhost:3000"
            )
            protocol = "http"
        else:
            # For production, use your actual frontend domain
            current_site_domain = "species-tracker.kuroshio-lab.com"
            protocol = "https"  # Always use HTTPS in production

        # Construct the password reset link for the frontend
        # Assuming your frontend has a route like /reset-password/<uid>/<token>/
        reset_link = (
            f"{protocol}://{current_site_domain}/reset-password/{uid}/{token}/"
        )

        # Render the email content using a template
        email_context = {
            "user": user,
            "reset_link": reset_link,
            "protocol": protocol,
            "domain": current_site_domain,
            "uid": uid,
            "token": token,
        }
        email_html_message = render_to_string(
            "users/password_reset_email.html", email_context
        )
        email_plain_message = render_to_string(
            "users/password_reset_email.txt", email_context
        )

        send_mail(
            subject="Password Reset Request",
            message=email_plain_message,
            html_message=email_html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )


class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        write_only=True, required=True, min_length=8
    )  # Add validation as needed
    re_new_password = serializers.CharField(
        write_only=True, required=True, min_length=8
    )

    def validate(self, data):
        if data["new_password"] != data["re_new_password"]:
            raise serializers.ValidationError(
                {"new_password": "New passwords must match."}
            )
        return data

    def save(self):
        try:
            uid = urlsafe_base64_decode(self.validated_data["uidb64"]).decode(
                "ascii"
            )
            user = User._default_manager.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(
            user, self.validated_data["token"]
        ):
            user.set_password(self.validated_data["new_password"])
            user.save()
            return user
        else:
            raise serializers.ValidationError(
                {"token": "The reset link is invalid or has expired."}
            )
