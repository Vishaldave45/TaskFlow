from rest_framework import serializers

from apps.users.serializers import UserResponseSerializer
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserResponseSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = ["id", "task", "user", "action", "details", "created_at"]
        read_only_fields = ["id", "task", "user", "action", "details", "created_at"]
