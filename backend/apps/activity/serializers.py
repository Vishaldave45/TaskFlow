from rest_framework import serializers
from .models import ActivityLog
from apps.users.serializers import UserSerializer

class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = ['id', 'action', 'user', 'task', 'old_value', 'new_value', 'created_at']
