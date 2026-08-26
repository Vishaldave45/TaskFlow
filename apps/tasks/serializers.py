from rest_framework import serializers
from apps.users.models import User
from apps.users.serializers import UserResponseSerializer
from .models import Task, TaskPriority, TaskStatus


class TaskCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True, default="")
    priority = serializers.ChoiceField(
        choices=TaskPriority.choices, default=TaskPriority.MEDIUM
    )
    assignee_id = serializers.IntegerField(required=False, allow_null=True)
    due_date = serializers.DateField(required=False, allow_null=True)

    def validate(self, attrs):
        assignee_id = attrs.pop("assignee_id", None)
        if assignee_id is not None:
            assignee = User.objects.filter(id=assignee_id).first()
            if not assignee:
                raise serializers.ValidationError({"assignee_id": "User not found."})
            attrs["assignee"] = assignee
        return attrs


class TaskUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    status = serializers.ChoiceField(choices=TaskStatus.choices, required=False)
    priority = serializers.ChoiceField(choices=TaskPriority.choices, required=False)
    assignee_id = serializers.IntegerField(required=False, allow_null=True)
    due_date = serializers.DateField(required=False, allow_null=True)

    def validate(self, attrs):
        if "assignee_id" in attrs:
            assignee_id = attrs.pop("assignee_id")
            if assignee_id is None:
                attrs["assignee"] = None
            else:
                assignee = User.objects.filter(id=assignee_id).first()
                if not assignee:
                    raise serializers.ValidationError({"assignee_id": "User not found."})
                attrs["assignee"] = assignee
        return attrs


class TaskResponseSerializer(serializers.ModelSerializer):
    creator = UserResponseSerializer(read_only=True)
    assignee = UserResponseSerializer(read_only=True)
    project_id = serializers.IntegerField(source="project.id", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "project_id",
            "creator",
            "assignee",
            "due_date",
            "created_at",
            "updated_at",
        ]
