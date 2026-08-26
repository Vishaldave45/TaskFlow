from rest_framework import serializers
from apps.users.serializers import UserResponseSerializer
from apps.users.models import User
from .models import Project, ProjectMember


class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["name", "description"]
        extra_kwargs = {
            "name": {"required": True},
            "description": {"required": False, "allow_blank": True},
        }


class ProjectUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["name", "description"]
        extra_kwargs = {
            "name": {"required": False},
            "description": {"required": False, "allow_blank": True},
        }


class ProjectResponseSerializer(serializers.ModelSerializer):
    owner = UserResponseSerializer(read_only=True)
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "owner",
            "members_count",
            "created_at",
            "updated_at",
        ]

    def get_members_count(self, obj: Project) -> int:
        return obj.members.count()


class ProjectMemberAddSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value: str) -> User:
        user = User.objects.filter(email__iexact=value).first()
        if not user:
            raise serializers.ValidationError("No user found with this email address.")
        return user


class ProjectMemberResponseSerializer(serializers.ModelSerializer):
    user = UserResponseSerializer(read_only=True)
    project_id = serializers.IntegerField(source="project.id", read_only=True)

    class Meta:
        model = ProjectMember
        fields = ["id", "project_id", "user", "created_at"]
