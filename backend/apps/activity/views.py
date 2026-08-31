from rest_framework import generics, permissions
from .models import ActivityLog
from .serializers import ActivityLogSerializer

class TaskActivityListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ActivityLogSerializer

    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return ActivityLog.objects.filter(task_id=task_id).order_by('-created_at')
