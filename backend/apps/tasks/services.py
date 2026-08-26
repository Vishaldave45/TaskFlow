from typing import Optional
from django.db import transaction
from django.db.models import QuerySet
from rest_framework.exceptions import ValidationError

from apps.activity.models import ActivityAction
from apps.activity.services import ActivityService
from apps.projects.models import Project
from apps.projects.repositories import ProjectRepository
from apps.users.models import User
from .models import Task
from .repositories import TaskRepository


class TaskService:
    def __init__(
        self,
        task_repository: TaskRepository | None = None,
        project_repository: ProjectRepository | None = None,
    ):
        self.task_repository = task_repository or TaskRepository()
        self.project_repository = project_repository or ProjectRepository()

    @transaction.atomic
    def create_task(self, *, project: Project, creator: User, data: dict) -> Task:
        assignee = data.get("assignee")
        if assignee and not self.project_repository.is_member(project, assignee):
            raise ValidationError({"assignee": "Assignee must be a member of this project."})

        task = self.task_repository.create(
            project=project,
            creator=creator,
            **data,
        )

        ActivityService.log(
            task=task,
            user=creator,
            action=ActivityAction.TASK_CREATED,
            details={"title": task.title, "status": task.status, "priority": task.priority},
        )

        return task

    def get_task(self, task_id: int) -> Optional[Task]:
        return self.task_repository.get_by_id(task_id)

    def list_tasks_for_project(self, project_id: int) -> QuerySet[Task]:
        return self.task_repository.list_for_project(project_id)

    @transaction.atomic
    def update_task(self, *, task: Task, data: dict, user: User) -> Task:
        old_status = task.status
        old_priority = task.priority
        old_assignee_id = task.assignee_id

        if "assignee" in data:
            assignee = data["assignee"]
            if assignee and not self.project_repository.is_member(task.project, assignee):
                raise ValidationError({"assignee": "Assignee must be a member of this project."})

        updated_task = self.task_repository.update(task, **data)

        # Log specific changes
        if "status" in data and data["status"] != old_status:
            ActivityService.log(
                task=updated_task,
                user=user,
                action=ActivityAction.STATUS_CHANGED,
                details={"from": old_status, "to": updated_task.status},
            )

        if "priority" in data and data["priority"] != old_priority:
            ActivityService.log(
                task=updated_task,
                user=user,
                action=ActivityAction.PRIORITY_CHANGED,
                details={"from": old_priority, "to": updated_task.priority},
            )

        if "assignee" in data and updated_task.assignee_id != old_assignee_id:
            ActivityService.log(
                task=updated_task,
                user=user,
                action=ActivityAction.TASK_ASSIGNED,
                details={
                    "from_user_id": old_assignee_id,
                    "to_user_id": updated_task.assignee_id,
                },
            )

        # If general fields (like title/description) changed without specific status/priority/assignee changes
        if any(k in data for k in ("title", "description", "due_date")):
            ActivityService.log(
                task=updated_task,
                user=user,
                action=ActivityAction.TASK_UPDATED,
                details={"updated_fields": [k for k in data.keys() if k in ("title", "description", "due_date")]},
            )

        return updated_task

    def delete_task(self, *, task: Task) -> None:
        self.task_repository.delete(task)
