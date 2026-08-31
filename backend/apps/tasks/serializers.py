from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Task
from apps.users.serializers import UserSerializer
from apps.projects.models import Project

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

    def validate(self, attrs):
        assignee = attrs.get('assignee')
        
        # Determine project context (either from instance during update, or view kwargs during create)
        project = None
        if self.instance:
            project = self.instance.project
        elif 'view' in self.context and 'project_id' in self.context['view'].kwargs:
            project_id = self.context['view'].kwargs['project_id']
            project = Project.objects.filter(id=project_id).first()

        # Invariant: If assignee is provided, they MUST be a member or owner of this task's project
        if assignee and project:
            is_member = project.owner == assignee or project.members.filter(user=assignee).exists()
            if not is_member:
                raise serializers.ValidationError({
                    "assignee_id": f"User '{assignee.email}' is not a collaborator on this project."
                })

        return attrs
