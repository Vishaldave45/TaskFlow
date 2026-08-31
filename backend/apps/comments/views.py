from rest_framework import generics, permissions
from rest_framework.exceptions import NotFound, PermissionDenied
from .models import Comment
from .serializers import CommentSerializer
from apps.tasks.models import Task

class TaskCommentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CommentSerializer

    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return Comment.objects.filter(task_id=task_id).order_by('created_at')

    def perform_create(self, serializer):
        task_id = self.kwargs.get('task_id')
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            raise NotFound("Task not found.")
        serializer.save(task=task, author=self.request.user)

class CommentDetailView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer

    def perform_destroy(self, instance):
        if instance.author != self.request.user and instance.task.project.owner != self.request.user:
            raise PermissionDenied("You do not have permission to delete this comment.")
        instance.delete()
