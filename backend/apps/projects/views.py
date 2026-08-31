from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from django.db.models import Q
from django.contrib.auth import get_user_model
from .models import Project, ProjectMember
from .serializers import ProjectSerializer, ProjectMemberSerializer

User = get_user_model()

class ProjectListCreateView(generics.ListCreateAPIView):
    """List projects accessible to the current user (owned or collaborating) or create a new project."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProjectSerializer

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(
            Q(owner=user) | Q(members__user=user)
        ).distinct().order_by('-created_at')

    def perform_create(self, serializer):
        project = serializer.save(owner=self.request.user)
        ProjectMember.objects.get_or_create(
            project=project,
            user=self.request.user,
            defaults={'role': 'OWNER'}
        )

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve project (members/owners), update (owner only), or delete (owner only)."""
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
    """List members (accessible by members/owners) or invite a new member (owner only)."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProjectMemberSerializer

    def get_project(self):
        project_id = self.kwargs.get('project_id')
        try:
            return Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            raise NotFound("Project not found.")

    def get_queryset(self):
        project = self.get_project()
        user = self.request.user

        # Ensure user is part of the project
        is_member = project.owner == user or project.members.filter(user=user).exists()
        if not is_member:
            raise PermissionDenied("You do not have permission to view members of this project.")

        return ProjectMember.objects.filter(project=project).select_related('user')

    def create(self, request, *args, **kwargs):
        project = self.get_project()
        user = self.request.user

        if project.owner != user:
            raise PermissionDenied("Only the project owner can add collaborators.")

        email = request.data.get('email')
        if not email:
            raise ValidationError({"email": "Email is required to invite a member."})

        try:
            target_user = User.objects.get(email=email.strip())
        except User.DoesNotExist:
            raise ValidationError({"email": f"No user found with email '{email}'."})

        # Check if already a member or owner
        if target_user == project.owner or ProjectMember.objects.filter(project=project, user=target_user).exists():
            return Response(
                {"error": {"code": "CONFLICT", "message": "User is already a member of this project."}},
                status=status.HTTP_409_CONFLICT
            )

        member = ProjectMember.objects.create(
            project=project,
            user=target_user,
            role='COLLABORATOR'
        )
        serializer = self.get_serializer(member)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ProjectMemberDeleteView(generics.DestroyAPIView):
    """Remove a collaborator from a project (owner only)."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProjectMemberSerializer

    def get_object(self):
        project_id = self.kwargs.get('project_id')
        user_id = self.kwargs.get('user_id')

        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            raise NotFound("Project not found.")

        # Invariant: Cannot remove the project owner
        if project.owner_id == user_id:
            raise ValidationError("Cannot remove the project owner from the project.")

        # Only the project owner or the user themselves (leaving) can remove
        if project.owner != self.request.user and user_id != self.request.user.id:
            raise PermissionDenied("Only the project owner can remove collaborators.")

        try:
            return ProjectMember.objects.get(project=project, user_id=user_id)
        except ProjectMember.DoesNotExist:
            raise NotFound("Member not found in this project.")
