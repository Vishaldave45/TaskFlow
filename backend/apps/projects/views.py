from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from django.db.models import Q
from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer

class ProjectListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(
            Q(owner=user) | Q(members__user=user)
        ).distinct().order_by('-created_at')

    def perform_create(self, serializer):
        project = serializer.save(owner=self.request.user)
        ProjectMember.objects.create(
            project=project,
            user=self.request.user,
            role='OWNER'
        )

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(
            Q(owner=user) | Q(members__user=user)
        ).distinct()

    def perform_update(self, serializer):
        project = self.get_object()
        if project.owner != self.request.user:
            raise PermissionDenied("Only the project owner can update project details.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            raise PermissionDenied("Only the project owner can delete this project.")
        instance.delete()

class ProjectMemberListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProjectMemberSerializer

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return ProjectMember.objects.filter(project_id=project_id)

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            raise NotFound("Project not found.")

        if project.owner != self.request.user:
            raise PermissionDenied("Only the project owner can add members.")

        serializer.save(project=project)

class ProjectMemberDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProjectMemberSerializer

    def get_object(self):
        project_id = self.kwargs.get('project_id')
        user_id = self.kwargs.get('user_id')
        try:
            member = ProjectMember.objects.get(project_id=project_id, user_id=user_id)
        except ProjectMember.DoesNotExist:
            raise NotFound("Member not found.")

        if member.project.owner != self.request.user and member.user != self.request.user:
            raise PermissionDenied("You do not have permission to remove this member.")
        return member
