from rest_framework import serializers
from .models import Observation

class ObservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Observation
        fields = '__all__'
        read_only_fields = ('user', 'source', 'validated')

    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = getattr(request, 'user', None)

        # Prevent hobbyist from updating 'validated' field
        if 'validated' in validated_data:
            if not user or not (user.is_staff or getattr(user, 'role', None) == 'researcher'):
                raise serializers.ValidationError({"validated": "You do not have permission to validate observations."})
        return super().update(instance, validated_data)
