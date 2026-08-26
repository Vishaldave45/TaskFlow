from typing import Optional
from django.db.models import Q, QuerySet
from apps.users.models import User
from .models import Project, ProjectMember


class ProjectRepository:
    def get_by_id(self, project_id: int) -> Optional[Project]:
        return (
            Project.objects.select_related("owner")
            .prefetch_related("members__user")
            .filter(id=project_id)
            .first()
        )

    def list_for_user(self, user: User) -> QuerySet[Project]:
        return (
            Project.objects.filter(
                Q(owner=user) | Q(members__user=user)
            )
            .select_related("owner")
            .prefetch_related("members__user")
            .distinct()
        )

    def create(self, name: str, description: str, owner: User) -> Project:
        return Project.objects.create(
            name=name,
            description=description,
            owner=owner,
        )

    def update(self, project: Project, **fields) -> Project:
        update_fields = []
        for field, value in fields.items():
            if hasattr(project, field):
                setattr(project, field, value)
                update_fields.append(field)
        if update_fields:
            update_fields.append("updated_at")
            project.save(update_fields=update_fields)
        return project

    def delete(self, project: Project) -> None:
        project.delete()

    def add_member(self, project: Project, user: User) -> ProjectMember:
        return ProjectMember.objects.create(project=project, user=user)

    def remove_member(self, project: Project, user: User) -> int:
        count, _ = ProjectMember.objects.filter(project=project, user=user).delete()
        return count

    def is_member(self, project: Project, user: User) -> bool:
        if project.owner_id == user.id:
            return True
        return ProjectMember.objects.filter(project=project, user=user).exists()

    def is_owner(self, project: Project, user: User) -> bool:
        return project.owner_id == user.id

    def list_members(self, project: Project) -> QuerySet[ProjectMember]:
        return ProjectMember.objects.filter(project=project).select_related("user")

    def get_member(self, project: Project, user: User) -> Optional[ProjectMember]:
        return (
            ProjectMember.objects.filter(project=project, user=user)
            .select_related("user")
            .first()
        )
