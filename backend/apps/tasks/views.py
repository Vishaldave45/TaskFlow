from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotFound, PermissionDenied
from django.db.models import Q
from .models import Task
from .serializers import TaskSerializer
from .permissions import IsProjectMemberForTask
from apps.projects.models import Project
from apps.activity.models import ActivityLog

class GlobalTaskListView(generics.ListAPIView):
    """List tasks accessible by current user across all projects (assigned, created, or in member projects)."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        user = self.request.user
        assigned_to_me = self.request.query_params.get('assigned_to_me')
        
        queryset = Task.objects.filter(
            Q(project__owner=user) | Q(project__members__user=user) | Q(assignee=user)
        ).distinct()

        if assigned_to_me == 'true':
            queryset = queryset.filter(assignee=user)

        return queryset.order_by('-created_at')

class ProjectTaskListCreateView(generics.ListCreateAPIView):
    """List tasks for a specific project or create a new task in that project."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        user = self.request.user

        # Ensure requester is owner or member of this project
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            raise NotFound("Project not found.")

        is_member = project.owner == user or project.members.filter(user=user).exists()
        if not is_member:
            raise PermissionDenied("You do not have permission to view tasks for this project.")

        return Task.objects.filter(project_id=project_id).order_by('-created_at')

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        user = self.request.user
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            raise NotFound("Project not found.")

        is_member = project.owner == user or project.members.filter(user=user).exists()
        if not is_member:
            raise PermissionDenied("You do not have permission to create tasks in this project.")

        task = serializer.save(project=project, creator=user)
        ActivityLog.objects.create(
            task=task,
            user=user,
            action="Created task",
            new_value=task.title
        )

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a task with object-level permission enforcement."""
    permission_classes = [permissions.IsAuthenticated, IsProjectMemberForTask]
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def perform_update(self, serializer):
        old_task = self.get_object()
        old_status = old_task.status
        old_assignee = old_task.assignee
        
        task = serializer.save()

        if old_status != task.status:
            ActivityLog.objects.create(
                task=task,
                user=self.request.user,
                action="Updated status",
                old_value=old_status,
                new_value=task.status
            )
        if old_assignee != task.assignee:
            ActivityLog.objects.create(
                task=task,
                user=self.request.user,
                action="Changed assignee",
                old_value=str(old_assignee) if old_assignee else "None",
                new_value=str(task.assignee) if task.assignee else "None"
            )

    def perform_destroy(self, instance):
        instance.delete()
