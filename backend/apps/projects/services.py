from typing import Optional
from django.db import IntegrityError, transaction
from django.db.models import QuerySet
from rest_framework.exceptions import ValidationError

from apps.users.models import User
from .models import Project, ProjectMember
from .repositories import ProjectRepository


class ProjectService:
    def __init__(self, repository: ProjectRepository | None = None):
        self.repository = repository or ProjectRepository()

    @transaction.atomic
    def create_project(self, *, name: str, description: str = "", owner: User) -> Project:
        project = self.repository.create(name=name, description=description, owner=owner)
        # Automatically add the creator as a project member
        self.repository.add_member(project=project, user=owner)
        return project

    def get_project(self, project_id: int) -> Optional[Project]:
        return self.repository.get_by_id(project_id)

    def list_projects_for_user(self, user: User) -> QuerySet[Project]:
        return self.repository.list_for_user(user)

    def update_project(
        self,
        *,
        project: Project,
        name: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Project:
        fields = {}
        if name is not None:
            fields["name"] = name
        if description is not None:
            fields["description"] = description
        return self.repository.update(project, **fields)

    def delete_project(self, *, project: Project) -> None:
        self.repository.delete(project)

    def add_member(self, *, project: Project, user: User) -> ProjectMember:
        if self.repository.is_member(project, user):
            raise ValidationError({"detail": "User is already a member of this project."})

        try:
            return self.repository.add_member(project=project, user=user)
        except IntegrityError:
            raise ValidationError({"detail": "User is already a member of this project."})

    def remove_member(self, *, project: Project, user: User) -> None:
        if project.owner_id == user.id:
            raise ValidationError({"detail": "Cannot remove the project owner from members."})

        member = self.repository.get_member(project, user)
        if not member:
            raise ValidationError({"detail": "User is not a member of this project."})

        self.repository.remove_member(project=project, user=user)

    def list_members(self, project: Project) -> QuerySet[ProjectMember]:
        return self.repository.list_members(project)
