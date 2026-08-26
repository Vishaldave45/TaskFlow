from rest_framework.permissions import BasePermission
from apps.projects.repositories import ProjectRepository
from .models import Task


class IsProjectMemberForTask(BasePermission):
    """
    Ensures the user is a member or owner of the project associated with the task.
    """

    def has_object_permission(self, request, view, obj: Task) -> bool:
        repo = ProjectRepository()
        return repo.is_member(obj.project, request.user)
