from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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
