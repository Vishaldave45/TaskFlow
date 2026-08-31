from rest_framework import generics, permissions
from rest_framework.exceptions import NotFound, PermissionDenied
from .models import Comment
from .serializers import CommentSerializer
from .permissions import IsCommentAuthorOrProjectOwner
from apps.tasks.models import Task

class TaskCommentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CommentSerializer

    def get_task(self):
        task_id = self.kwargs.get('task_id')
        try:
            return Task.objects.select_related('project').get(id=task_id)
        except Task.DoesNotExist:
            raise NotFound("Task not found.")

    def get_queryset(self):
        task = self.get_task()
        user = self.request.user
        project = task.project

        is_member = project.owner == user or project.members.filter(user=user).exists()
        if not is_member:
            raise PermissionDenied("You do not have permission to view comments for this task.")

        return Comment.objects.filter(task=task).order_by('created_at')

    def perform_create(self, serializer):
        task = self.get_task()
        user = self.request.user
        project = task.project

        is_member = project.owner == user or project.members.filter(user=user).exists()
        if not is_member:
            raise PermissionDenied("You do not have permission to post comments on this task.")

        serializer.save(task=task, author=user)

class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update (author only), or delete (author or project owner) a comment."""
    permission_classes = [permissions.IsAuthenticated, IsCommentAuthorOrProjectOwner]
    queryset = Comment.objects.select_related('task__project', 'author').all()
    serializer_class = CommentSerializer
