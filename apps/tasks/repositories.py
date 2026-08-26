from typing import Optional
from django.db.models import QuerySet
from apps.projects.models import Project
from apps.users.models import User
from .models import Task


class TaskRepository:
    def get_by_id(self, task_id: int) -> Optional[Task]:
        return (
            Task.objects.select_related("project", "creator", "assignee", "project__owner")
            .filter(id=task_id)
            .first()
        )

    def list_for_project(self, project_id: int) -> QuerySet[Task]:
        return (
            Task.objects.filter(project_id=project_id)
            .select_related("creator", "assignee", "project")
        )

    def create(self, *, project: Project, creator: User, **fields) -> Task:
        return Task.objects.create(
            project=project,
            creator=creator,
            **fields,
        )

    def update(self, task: Task, **fields) -> Task:
        update_fields = []
        for field, value in fields.items():
            if hasattr(task, field):
                setattr(task, field, value)
                update_fields.append(field)
        if update_fields:
            update_fields.append("updated_at")
            task.save(update_fields=update_fields)
        return task

    def delete(self, task: Task) -> None:
        task.delete()
