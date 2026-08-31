from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Task
from apps.users.serializers import UserSerializer

User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    assignee_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='assignee', write_only=True, required=False, allow_null=True
    )
    creator = UserSerializer(read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority',
            'assignee', 'assignee_id', 'creator', 'project',
            'due_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'creator', 'project', 'created_at', 'updated_at']
