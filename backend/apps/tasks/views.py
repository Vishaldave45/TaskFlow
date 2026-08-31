from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotFound, PermissionDenied
from .models import Task
from .serializers import TaskSerializer
from apps.projects.models import Project
from apps.activity.models import ActivityLog

class ProjectTaskListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return Task.objects.filter(project_id=project_id).order_by('-created_at')

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            raise NotFound("Project not found.")

        task = serializer.save(project=project, creator=self.request.user)
        ActivityLog.objects.create(
            task=task,
            user=self.request.user,
            action="Created task",
            new_value=task.title
        )

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
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
