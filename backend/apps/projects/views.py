from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import User
from .models import Project
from .permissions import IsProjectMember, IsProjectOwner
from .serializers import (
    ProjectCreateSerializer,
    ProjectMemberAddSerializer,
    ProjectMemberResponseSerializer,
    ProjectResponseSerializer,
    ProjectUpdateSerializer,
)
from .services import ProjectService


class ProjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ProjectService()

    def get(self, request):
        projects = self.service.list_projects_for_user(request.user)
        serializer = ProjectResponseSerializer(projects, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ProjectCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        project = self.service.create_project(
            name=serializer.validated_data["name"],
            description=serializer.validated_data.get("description", ""),
            owner=request.user,
        )

        response_serializer = ProjectResponseSerializer(project)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ProjectService()

    def _get_project(self, request, pk: int) -> Project:
        project = self.service.get_project(pk)
        if not project:
            raise NotFound("Project not found.")
        return project

    def get(self, request, pk: int):
        project = self._get_project(request, pk)
        self.check_object_permissions(request, project)
        if not IsProjectMember().has_object_permission(request, self, project):
            raise PermissionDenied("You do not have access to this project.")

        serializer = ProjectResponseSerializer(project)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk: int):
        project = self._get_project(request, pk)
        if not IsProjectOwner().has_object_permission(request, self, project):
            raise PermissionDenied("Only the project owner can update this project.")

        serializer = ProjectUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        updated_project = self.service.update_project(
            project=project,
            name=serializer.validated_data.get("name"),
            description=serializer.validated_data.get("description"),
        )
        return Response(ProjectResponseSerializer(updated_project).data, status=status.HTTP_200_OK)

    def delete(self, request, pk: int):
        project = self._get_project(request, pk)
        if not IsProjectOwner().has_object_permission(request, self, project):
            raise PermissionDenied("Only the project owner can delete this project.")

        self.service.delete_project(project=project)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectMemberListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ProjectService()

    def _get_project(self, pk: int) -> Project:
        project = self.service.get_project(pk)
        if not project:
            raise NotFound("Project not found.")
        return project

    def get(self, request, pk: int):
        project = self._get_project(pk)
        if not IsProjectMember().has_object_permission(request, self, project):
            raise PermissionDenied("You do not have access to this project.")

        members = self.service.list_members(project)
        serializer = ProjectMemberResponseSerializer(members, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, pk: int):
        project = self._get_project(pk)
        if not IsProjectOwner().has_object_permission(request, self, project):
            raise PermissionDenied("Only the project owner can add members.")

        serializer = ProjectMemberAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target_user = serializer.validated_data["email"]
        member = self.service.add_member(project=project, user=target_user)
        return Response(
            ProjectMemberResponseSerializer(member).data,
            status=status.HTTP_201_CREATED,
        )


class ProjectMemberDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ProjectService()

    def delete(self, request, pk: int, user_id: int):
        project = self.service.get_project(pk)
        if not project:
            raise NotFound("Project not found.")

        # Allow project owner to remove members, or a member to remove themselves (leave project)
        is_owner = IsProjectOwner().has_object_permission(request, self, project)
        is_self = request.user.id == user_id

        if not (is_owner or is_self):
            raise PermissionDenied("You do not have permission to remove this member.")

        target_user = get_object_or_404(User, id=user_id)
        self.service.remove_member(project=project, user=target_user)
        return Response(status=status.HTTP_204_NO_CONTENT)
