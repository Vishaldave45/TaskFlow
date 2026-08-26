from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.projects.models import Project
from apps.projects.permissions import IsProjectMember
from apps.projects.services import ProjectService
from core.pagination import StandardPagination
from .filters import TaskFilter
from .models import Task
from .permissions import IsProjectMemberForTask
from .serializers import (
    TaskCreateSerializer,
    TaskResponseSerializer,
    TaskUpdateSerializer,
)
from .services import TaskService


class ProjectTaskListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.project_service = ProjectService()
        self.task_service = TaskService()

    def _get_project(self, request, project_id: int) -> Project:
        project = self.project_service.get_project(project_id)
        if not project:
            raise NotFound("Project not found.")
        if not IsProjectMember().has_object_permission(request, self, project):
            raise PermissionDenied("You do not have access to this project.")
        return project

    def get(self, request, project_id: int):
        project = self._get_project(request, project_id)
        tasks = self.task_service.list_tasks_for_project(project.id)

        # Apply django_filters FilterSet
        filterset = TaskFilter(request.query_params, queryset=tasks, request=request)
        if filterset.is_valid():
            tasks = filterset.qs

        # Apply pagination if configured
        paginator = StandardPagination()
        page = paginator.paginate_queryset(tasks, request)
        if page is not None:
            serializer = TaskResponseSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = TaskResponseSerializer(tasks, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, project_id: int):
        project = self._get_project(request, project_id)

        serializer = TaskCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        task = self.task_service.create_task(
            project=project,
            creator=request.user,
            data=serializer.validated_data,
        )

        response_serializer = TaskResponseSerializer(task)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.task_service = TaskService()

    def _get_task(self, request, pk: int) -> Task:
        task = self.task_service.get_task(pk)
        if not task:
            raise NotFound("Task not found.")
        if not IsProjectMemberForTask().has_object_permission(request, self, task):
            raise PermissionDenied("You do not have access to this task.")
        return task

    def get(self, request, pk: int):
        task = self._get_task(request, pk)
        serializer = TaskResponseSerializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk: int):
        task = self._get_task(request, pk)

        serializer = TaskUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        updated_task = self.task_service.update_task(
            task=task,
            data=serializer.validated_data,
            user=request.user,
        )
        return Response(TaskResponseSerializer(updated_task).data, status=status.HTTP_200_OK)

    def delete(self, request, pk: int):
        task = self._get_task(request, pk)
        self.task_service.delete_task(task=task)
        return Response(status=status.HTTP_204_NO_CONTENT)
