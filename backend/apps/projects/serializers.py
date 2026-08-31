from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, ProjectMember
from apps.users.serializers import UserSerializer

User = get_user_model()

class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True, required=False
    )
    email = serializers.EmailField(write_only=True, required=False)

    class Meta:
        model = ProjectMember
        fields = ['id', 'user', 'user_id', 'email', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']

    def create(self, validated_data):
        email = validated_data.pop('email', None)
        project = validated_data.get('project')
        if email:
            try:
                user = User.objects.get(email=email)
                validated_data['user'] = user
            except User.DoesNotExist:
                raise serializers.ValidationError({"email": "User with this email does not exist."})
        return super().create(validated_data)

class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'owner', 'members_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']

    def get_members_count(self, obj):
        return obj.members.count()
