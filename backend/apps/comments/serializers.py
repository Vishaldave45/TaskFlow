from rest_framework import serializers

from apps.users.serializers import UserResponseSerializer
from .models import Comment


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["content"]
        extra_kwargs = {
            "content": {"required": True, "allow_blank": False},
        }


class CommentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["content"]
        extra_kwargs = {
            "content": {"required": True, "allow_blank": False},
        }


class CommentResponseSerializer(serializers.ModelSerializer):
    author = UserResponseSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "task", "author", "content", "created_at", "updated_at"]
        read_only_fields = ["id", "task", "author", "created_at", "updated_at"]
