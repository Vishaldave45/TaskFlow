from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.tasks.models import Task
from apps.tasks.permissions import IsProjectMemberForTask
from apps.tasks.services import TaskService
from core.pagination import StandardPagination
from .models import Comment
from .permissions import IsCommentAuthor
from .serializers import (
    CommentCreateSerializer,
    CommentResponseSerializer,
    CommentUpdateSerializer,
)
from .services import CommentService


class TaskCommentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.task_service = TaskService()
        self.comment_service = CommentService()

    def _get_task(self, request, task_id: int) -> Task:
        task = self.task_service.get_task(task_id)
        if not task:
            raise NotFound("Task not found.")
        if not IsProjectMemberForTask().has_object_permission(request, self, task):
            raise PermissionDenied("You do not have access to this task.")
        return task

    def get(self, request, task_id: int):
        self._get_task(request, task_id)
        comments = self.comment_service.list_comments_for_task(task_id)

        paginator = StandardPagination()
        page = paginator.paginate_queryset(comments, request)
        if page is not None:
            serializer = CommentResponseSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = CommentResponseSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, task_id: int):
        task = self._get_task(request, task_id)

        serializer = CommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        comment = self.comment_service.create_comment(
            task=task,
            author=request.user,
            content=serializer.validated_data["content"],
        )

        response_serializer = CommentResponseSerializer(comment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class CommentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.comment_service = CommentService()

    def _get_comment(self, request, pk: int) -> Comment:
        comment = self.comment_service.get_comment(pk)
        if not comment:
            raise NotFound("Comment not found.")
        return comment

    def get(self, request, pk: int):
        comment = self._get_comment(request, pk)
        if not IsProjectMemberForTask().has_object_permission(request, self, comment.task):
            raise PermissionDenied("You do not have access to this comment.")
        serializer = CommentResponseSerializer(comment)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk: int):
        comment = self._get_comment(request, pk)
        if not IsCommentAuthor().has_object_permission(request, self, comment):
            raise PermissionDenied("You can only edit your own comments.")

        serializer = CommentUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated_comment = self.comment_service.update_comment(
            comment=comment,
            user=request.user,
            content=serializer.validated_data["content"],
        )
        return Response(CommentResponseSerializer(updated_comment).data, status=status.HTTP_200_OK)

    def delete(self, request, pk: int):
        comment = self._get_comment(request, pk)
        if not IsCommentAuthor().has_object_permission(request, self, comment):
            raise PermissionDenied("You do not have permission to delete this comment.")

        self.comment_service.delete_comment(comment=comment, user=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
