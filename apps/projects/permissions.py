from rest_framework.permissions import BasePermission
from .models import Project, ProjectMember
from .repositories import ProjectRepository


class IsProjectOwner(BasePermission):
    """
    Allows access only to the project owner.
    """

    def has_object_permission(self, request, view, obj) -> bool:
        if isinstance(obj, Project):
            return obj.owner_id == request.user.id
        if isinstance(obj, ProjectMember):
            return obj.project.owner_id == request.user.id
        return False


class IsProjectMember(BasePermission):
    """
    Allows access to users who are members (or owner) of the project.
    """

    def has_object_permission(self, request, view, obj) -> bool:
        repo = ProjectRepository()
        if isinstance(obj, Project):
            return repo.is_member(obj, request.user)
        if isinstance(obj, ProjectMember):
            return repo.is_member(obj.project, request.user)
        return False
