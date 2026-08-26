from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.tasks.models import Task
from apps.tasks.permissions import IsProjectMemberForTask
from apps.tasks.services import TaskService
from core.pagination import StandardPagination
from .serializers import ActivityLogSerializer
from .services import ActivityService


class TaskActivityListView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.task_service = TaskService()
        self.activity_service = ActivityService()

    def get(self, request, task_id: int):
        task = self.task_service.get_task(task_id)
        if not task:
            raise NotFound("Task not found.")

        if not IsProjectMemberForTask().has_object_permission(request, self, task):
            raise PermissionDenied("You do not have access to this task's activity log.")

        logs = self.activity_service.list_for_task(task_id)

        paginator = StandardPagination()
        page = paginator.paginate_queryset(logs, request)
        if page is not None:
            serializer = ActivityLogSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = ActivityLogSerializer(logs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
