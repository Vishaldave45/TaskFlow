from rest_framework import serializers
from .models import Comment
from apps.users.serializers import UserSerializer

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'task', 'author', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'task', 'author', 'created_at', 'updated_at']
